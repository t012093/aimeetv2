import { MeetingMinutes } from '../processors/minutes-generator.js';
import { ProjectType } from './notion.js';

export interface SlackMessage {
  text: string;
  blocks?: any[];
  channel?: string;
}

export interface SlackMemberMapping {
  [key: string]: string; // name -> Slack user ID
}

export class SlackService {
  private webhookUrl: string;
  private webhookUrlMapping: Record<ProjectType, string>;
  private memberMapping: SlackMemberMapping;
  private channelMapping: Record<ProjectType, string>;

  constructor(
    webhookUrl: string,
    memberMapping: SlackMemberMapping = {},
    channelMapping?: Record<ProjectType, string>,
    webhookUrlMapping?: Record<ProjectType, string>
  ) {
    this.webhookUrl = webhookUrl;
    this.memberMapping = memberMapping;
    this.channelMapping = channelMapping || {
      international: process.env.SLACK_INTERNATIONAL_CHANNEL || 'general',
      programming: process.env.SLACK_PROGRAMMING_CHANNEL || 'general',
      art: process.env.SLACK_ART_CHANNEL || 'general',
      default: process.env.SLACK_DEFAULT_CHANNEL || 'general',
    };
    this.webhookUrlMapping = webhookUrlMapping || {
      international: process.env.SLACK_WEBHOOK_URL_INTERNATIONAL || webhookUrl,
      programming: process.env.SLACK_WEBHOOK_URL_PROGRAMMING || webhookUrl,
      art: process.env.SLACK_WEBHOOK_URL_ART || webhookUrl,
      default: webhookUrl,
    };
  }

  /**
   * Get Slack channel for project type
   */
  getChannelForProject(projectType: ProjectType): string {
    return this.channelMapping[projectType];
  }

  /**
   * Get Webhook URL for project type
   */
  private getWebhookUrlForProject(projectType: ProjectType): string {
    return this.webhookUrlMapping[projectType];
  }

  /**
   * Convert name to Slack mention format
   */
  private mentionUser(name: string): string {
    const userId = this.memberMapping[name];
    if (userId) {
      return `<@${userId}>`;
    }
    return name; // Fallback to plain text name
  }

  /**
   * Post meeting minutes to Slack channel
   */
  async postMeetingMinutes(
    title: string,
    minutes: MeetingMinutes,
    notionUrl?: string,
    meetLink?: string,
    projectType: ProjectType = 'default'
  ): Promise<void> {
    const message = this.formatMinutesMessage(title, minutes, notionUrl, meetLink, projectType);

    // Use project-specific webhook URL
    const webhookUrl = this.getWebhookUrlForProject(projectType);

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }

  /**
   * Format meeting minutes as Slack message with blocks
   */
  private formatMinutesMessage(
    title: string,
    minutes: MeetingMinutes,
    notionUrl?: string,
    meetLink?: string,
    projectType: ProjectType = 'default'
  ): SlackMessage {
    const blocks: any[] = [];

    // Project badge
    const projectEmoji = {
      international: '🌍',
      programming: '💻',
      art: '🎨',
      default: '📋',
    }[projectType];

    const projectName = {
      international: '国際交流',
      programming: 'プログラミング教室',
      art: 'アート支援',
      default: '会議',
    }[projectType];

    // Header with project info
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: `${projectEmoji} ${projectName} - ${title}`,
        emoji: true,
      },
    });

    // Links section
    if (notionUrl || meetLink) {
      const elements: any[] = [];

      if (notionUrl) {
        elements.push({
          type: 'button',
          text: {
            type: 'plain_text',
            text: '📝 議事録を見る',
            emoji: true,
          },
          url: notionUrl,
          action_id: 'view_notion',
        });
      }

      if (meetLink) {
        elements.push({
          type: 'button',
          text: {
            type: 'plain_text',
            text: '🎥 Meet録画',
            emoji: true,
          },
          url: meetLink,
          action_id: 'view_meet',
        });
      }

      blocks.push({
        type: 'actions',
        elements,
      });
    }

    blocks.push({
      type: 'divider',
    });

    // Summary
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📝 概要*\n${minutes.summary}`,
      },
    });

    // Key Points
    if (minutes.keyPoints.length > 0) {
      const keyPointsText = minutes.keyPoints.map(point => `• ${point}`).join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*💡 重要なポイント*\n${keyPointsText}`,
        },
      });
    }

    // Decisions
    if (minutes.decisions.length > 0) {
      const decisionsText = minutes.decisions.map(decision => `• ${decision}`).join('\n');
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*✅ 決定事項*\n${decisionsText}`,
        },
      });
    }

    // Action Items with mentions
    if (minutes.actionItems.length > 0) {
      const actionItemsText = minutes.actionItems
        .map(item => {
          const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
          const ownerStr = item.owner ? ` (${this.mentionUser(item.owner)})` : '';
          const deadlineStr = item.deadline ? ` _[期限: ${item.deadline}]_` : '';
          const description = item.description || item.task;
          return `${priorityEmoji} ${description}${ownerStr}${deadlineStr}`;
        })
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🎯 アクションアイテム*\n${actionItemsText}`,
        },
      });

      // Add mention summary for important items
      const highPriorityOwners = minutes.actionItems
        .filter(item => item.priority === 'high' && item.owner)
        .map(item => this.mentionUser(item.owner!))
        .filter((value, index, self) => self.indexOf(value) === index); // unique

      if (highPriorityOwners.length > 0) {
        blocks.push({
          type: 'context',
          elements: [
            {
              type: 'mrkdwn',
              text: `🔴 重要タスク担当: ${highPriorityOwners.join(', ')}`,
            },
          ],
        });
      }
    }

    // Unresolved Issues (if any)
    if (minutes.unresolvedIssues && minutes.unresolvedIssues.length > 0) {
      const unresolvedText = minutes.unresolvedIssues
        .slice(0, 3) // Show first 3
        .map(issue => {
          const priorityEmoji = issue.priority === 'high' ? '🔴' : issue.priority === 'medium' ? '🟡' : '🟢';
          return `${priorityEmoji} ${issue.issue}`;
        })
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*⚠️ 未解決事項*\n${unresolvedText}`,
        },
      });
    }

    // AI Suggestions (top 2)
    if (minutes.aiSuggestions && minutes.aiSuggestions.length > 0) {
      const topSuggestions = minutes.aiSuggestions
        .filter(s => s.priority === 'high')
        .slice(0, 2)
        .map(s => `• ${s.suggestion}`)
        .join('\n');

      if (topSuggestions) {
        blocks.push({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*🤖 AI提案*\n${topSuggestions}`,
          },
        });
      }
    }

    // Participants
    if (minutes.participants && minutes.participants.length > 0) {
      blocks.push({
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `👥 参加者: ${minutes.participants.join(', ')}`,
          },
        ],
      });
    }

    // Footer
    blocks.push({
      type: 'divider',
    });
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `🤖 AI生成 | ${new Date(minutes.generatedAt).toLocaleString('ja-JP')} | チャンネル: #${this.getChannelForProject(projectType)}`,
        },
      ],
    });

    return {
      text: `${projectEmoji} ${projectName} 議事録: ${title}`, // Fallback text
      blocks,
    };
  }

  /**
   * Post a simple text message
   */
  async postMessage(text: string): Promise<void> {
    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook failed: ${response.statusText}`);
    }
  }
}

/**
 * Create SlackService from environment variable
 */
export function createSlackServiceFromEnv(): SlackService {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    throw new Error('Missing SLACK_WEBHOOK_URL environment variable');
  }

  // Load member mapping from environment (JSON format)
  let memberMapping: SlackMemberMapping = {};
  if (process.env.SLACK_MEMBER_MAPPING) {
    try {
      memberMapping = JSON.parse(process.env.SLACK_MEMBER_MAPPING);
    } catch (error) {
      console.warn('Failed to parse SLACK_MEMBER_MAPPING:', error);
    }
  }

  // Load channel mapping from environment
  const channelMapping: Record<ProjectType, string> = {
    international: process.env.SLACK_INTERNATIONAL_CHANNEL || 'general',
    programming: process.env.SLACK_PROGRAMMING_CHANNEL || 'general',
    art: process.env.SLACK_ART_CHANNEL || 'general',
    default: process.env.SLACK_DEFAULT_CHANNEL || 'general',
  };

  // Load project-specific webhook URLs
  const webhookUrlMapping: Record<ProjectType, string> = {
    international: process.env.SLACK_WEBHOOK_URL_INTERNATIONAL || webhookUrl,
    programming: process.env.SLACK_WEBHOOK_URL_PROGRAMMING || webhookUrl,
    art: process.env.SLACK_WEBHOOK_URL_ART || webhookUrl,
    default: webhookUrl,
  };

  return new SlackService(webhookUrl, memberMapping, channelMapping, webhookUrlMapping);
}
