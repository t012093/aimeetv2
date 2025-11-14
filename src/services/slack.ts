import { MeetingMinutes } from '../processors/minutes-generator.js';

export interface SlackMessage {
  text: string;
  blocks?: any[];
}

export class SlackService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  /**
   * Post meeting minutes to Slack channel
   */
  async postMeetingMinutes(
    title: string,
    minutes: MeetingMinutes,
    notionUrl?: string,
    meetLink?: string
  ): Promise<void> {
    const message = this.formatMinutesMessage(title, minutes, notionUrl, meetLink);

    const response = await fetch(this.webhookUrl, {
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
    meetLink?: string
  ): SlackMessage {
    const blocks: any[] = [];

    // Header
    blocks.push({
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📋 ${title}`,
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

    // Action Items
    if (minutes.actionItems.length > 0) {
      const actionItemsText = minutes.actionItems
        .map(item => {
          const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
          const ownerStr = item.owner ? ` (${item.owner})` : '';
          const deadlineStr = item.deadline ? ` _[期限: ${item.deadline}]_` : '';
          return `${priorityEmoji} ${item.task}${ownerStr}${deadlineStr}`;
        })
        .join('\n');

      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🎯 アクションアイテム*\n${actionItemsText}`,
        },
      });
    }

    // Participants
    if (minutes.participants.length > 0) {
      blocks.push({
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*👥 参加者*\n${minutes.participants.join(', ')}`,
        },
      });
    }

    // Footer
    blocks.push({
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: `🤖 AI生成 | ${new Date(minutes.generatedAt).toLocaleString('ja-JP')}`,
        },
      ],
    });

    return {
      text: `議事録: ${title}`, // Fallback text
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

  return new SlackService(webhookUrl);
}
