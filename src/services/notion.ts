import { Client } from '@notionhq/client';
import { MeetingMinutes } from '../processors/minutes-generator.js';

export interface NotionMeetingPage {
  id: string;
  url: string;
}

export class NotionService {
  private notion: Client;
  private databaseId: string;

  constructor(apiKey: string, databaseId: string) {
    this.notion = new Client({ auth: apiKey });
    this.databaseId = databaseId;
  }

  /**
   * Create a new meeting minutes page in Notion database
   */
  async createMeetingPage(
    title: string,
    minutes: MeetingMinutes,
    _meetLink?: string,
    _calendarEventId?: string
  ): Promise<NotionMeetingPage> {
    const response = await this.notion.pages.create({
      parent: { database_id: this.databaseId },
      properties: {
        // Title property (usually "Name" or "Title")
        Name: {
          title: [
            {
              text: {
                content: title,
              },
            },
          ],
        },
      },
      children: this.formatMinutesAsBlocks(minutes),
    });

    return {
      id: response.id,
      url: 'url' in response ? response.url : `https://notion.so/${response.id.replace(/-/g, '')}`,
    };
  }

  /**
   * Format meeting minutes as Notion blocks
   */
  private formatMinutesAsBlocks(minutes: MeetingMinutes): any[] {
    const blocks: any[] = [];

    // Meeting info header
    const meetingDate = new Date(minutes.generatedAt).toLocaleString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    blocks.push({
      object: 'block',
      type: 'callout',
      callout: {
        icon: { emoji: '📅' },
        rich_text: [{ type: 'text', text: { content: `日付: ${meetingDate}` } }],
      },
    });

    if (minutes.participants && minutes.participants.length > 0) {
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          icon: { emoji: '👥' },
          rich_text: [{ type: 'text', text: { content: `参加者: ${minutes.participants.join(', ')}` } }],
        },
      });
    }

    blocks.push({
      object: 'block',
      type: 'divider',
      divider: {},
    });

    // Summary
    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: '📝 概要' } }],
      },
    });
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [{ type: 'text', text: { content: minutes.summary } }],
      },
    });

    // Key Points
    if (minutes.keyPoints && minutes.keyPoints.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '💡 重要なポイント' } }],
        },
      });
      minutes.keyPoints.forEach(point => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: `✨ ${point}` } }],
          },
        });
      });
    }

    // Decisions
    if (minutes.decisions && minutes.decisions.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '✅ 決定事項' } }],
        },
      });
      minutes.decisions.forEach(decision => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [{ type: 'text', text: { content: `✔️ ${decision}` } }],
          },
        });
      });
    }

    // Action Items (with table)
    if (minutes.actionItems && minutes.actionItems.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🎯 アクションアイテム' } }],
        },
      });

      // Create table
      const tableRows: any[] = [];

      // Header row
      tableRows.push({
        object: 'block',
        type: 'table_row',
        table_row: {
          cells: [
            [{ type: 'text', text: { content: '優先度' } }],
            [{ type: 'text', text: { content: 'タスク' } }],
            [{ type: 'text', text: { content: '担当者' } }],
            [{ type: 'text', text: { content: '期限' } }],
            [{ type: 'text', text: { content: '状態' } }],
          ],
        },
      });

      // Data rows
      minutes.actionItems.forEach(item => {
        const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
        const description = item.description || item.task;
        const ownerStr = item.owner || '未定';
        const deadlineStr = item.deadline || '未定';

        tableRows.push({
          object: 'block',
          type: 'table_row',
          table_row: {
            cells: [
              [{ type: 'text', text: { content: priorityEmoji } }],
              [{ type: 'text', text: { content: description } }],
              [{ type: 'text', text: { content: ownerStr } }],
              [{ type: 'text', text: { content: deadlineStr } }],
              [{ type: 'text', text: { content: '⬜' } }],
            ],
          },
        });
      });

      blocks.push({
        object: 'block',
        type: 'table',
        table: {
          table_width: 5,
          has_column_header: true,
          has_row_header: false,
          children: tableRows,
        },
      });
    }

    // Unresolved Issues
    if (minutes.unresolvedIssues && minutes.unresolvedIssues.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '⚠️ 未解決事項' } }],
        },
      });
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{ type: 'text', text: { content: '以下の事項については会議中に結論が出ませんでした。次回の議論が必要です。' } }],
        },
      });

      minutes.unresolvedIssues.forEach((issue, index) => {
        const priorityEmoji = issue.priority === 'high' ? '🔴' : issue.priority === 'medium' ? '🟡' : '🟢';

        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: `${priorityEmoji} ${index + 1}. ${issue.issue}` } }],
          },
        });
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `📌 背景: ${issue.context}` } }],
          },
        });
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `💡 推奨アクション: ${issue.suggestedAction}` } }],
          },
        });
      });
    }

    // AI Suggestions
    if (minutes.aiSuggestions && minutes.aiSuggestions.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🤖 AIからの提案・アドバイス' } }],
        },
      });
      blocks.push({
        object: 'block',
        type: 'quote',
        quote: {
          rich_text: [{ type: 'text', text: { content: 'AIが会議内容を分析し、以下の提案をします。' } }],
        },
      });

      minutes.aiSuggestions.forEach((suggestion, index) => {
        const categoryEmoji =
          suggestion.category === 'process' ? '⚙️' :
          suggestion.category === 'decision' ? '🎯' :
          suggestion.category === 'risk' ? '⚠️' :
          suggestion.category === 'opportunity' ? '🌟' :
          suggestion.category === 'resource' ? '📦' : '💡';

        const priorityLabel = suggestion.priority === 'high' ? ' **[重要]**' :
                            suggestion.priority === 'medium' ? ' *[中]*' : ' [低]';

        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [{ type: 'text', text: { content: `${categoryEmoji} ${index + 1}. ${suggestion.suggestion}${priorityLabel}` } }],
          },
        });
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `理由: ${suggestion.reasoning}` } }],
          },
        });
      });
    }

    // Risks (with table)
    if (minutes.risks && minutes.risks.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '⚡ リスク分析' } }],
        },
      });

      // Create table
      const riskTableRows: any[] = [];

      // Header row
      riskTableRows.push({
        object: 'block',
        type: 'table_row',
        table_row: {
          cells: [
            [{ type: 'text', text: { content: 'リスク' } }],
            [{ type: 'text', text: { content: '影響度' } }],
            [{ type: 'text', text: { content: '発生確率' } }],
            [{ type: 'text', text: { content: '軽減策' } }],
          ],
        },
      });

      // Data rows
      minutes.risks.forEach(risk => {
        const impactEmoji = risk.impact === 'high' ? '🔴' : risk.impact === 'medium' ? '🟡' : '🟢';
        const likelihoodEmoji = risk.likelihood === 'high' ? '🔴' : risk.likelihood === 'medium' ? '🟡' : '🟢';

        riskTableRows.push({
          object: 'block',
          type: 'table_row',
          table_row: {
            cells: [
              [{ type: 'text', text: { content: risk.risk } }],
              [{ type: 'text', text: { content: `${impactEmoji} ${risk.impact}` } }],
              [{ type: 'text', text: { content: `${likelihoodEmoji} ${risk.likelihood}` } }],
              [{ type: 'text', text: { content: risk.mitigation } }],
            ],
          },
        });
      });

      blocks.push({
        object: 'block',
        type: 'table',
        table: {
          table_width: 4,
          has_column_header: true,
          has_row_header: false,
          children: riskTableRows,
        },
      });
    }

    // Timeline
    if (minutes.timeline && minutes.timeline.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '📅 タイムライン' } }],
        },
      });

      minutes.timeline.forEach(item => {
        const statusEmoji =
          item.status === 'in-progress' ? '🔄' :
          item.status === 'completed' ? '✅' :
          item.status === 'planned' ? '📋' : '⏳';

        blocks.push({
          object: 'block',
          type: 'callout',
          callout: {
            icon: { emoji: statusEmoji },
            rich_text: [
              {
                type: 'text',
                text: { content: `${item.milestone} - 期限: ${item.deadline}` },
                annotations: { bold: true }
              }
            ],
          },
        });

        if (item.dependencies && item.dependencies.length > 0) {
          blocks.push({
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [
                { type: 'text', text: { content: `   依存: ${item.dependencies.join(', ')}` } }
              ],
            },
          });
        }
      });
    }

    // Next Steps
    if (minutes.nextSteps && minutes.nextSteps.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🚀 次のステップ' } }],
        },
      });

      minutes.nextSteps.forEach((step) => {
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [{ type: 'text', text: { content: step } }],
          },
        });
      });
    }

    // Action Flow (as a text representation since Notion doesn't support Mermaid)
    if (minutes.actionItems && minutes.actionItems.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [{ type: 'text', text: { content: '🔄 アクションフロー' } }],
        },
      });

      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          icon: { emoji: '📊' },
          rich_text: [
            { type: 'text', text: { content: '会議終了 → アクションアイテム実行 → 完了' } }
          ],
        },
      });

      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: { content: 'アクションアイテム:' },
              annotations: { bold: true }
            }
          ],
        },
      });

      minutes.actionItems.forEach((item, index) => {
        const description = item.description || item.task;
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              { type: 'text', text: { content: `${index + 1}. ${description}` } }
            ],
          },
        });
      });
    }

    // Transcript (collapsible)
    blocks.push({
      object: 'block',
      type: 'divider',
      divider: {},
    });
    blocks.push({
      object: 'block',
      type: 'toggle',
      toggle: {
        rich_text: [{ type: 'text', text: { content: '📄 文字起こし全文' } }],
        children: [
          {
            object: 'block',
            type: 'code',
            code: {
              rich_text: [
                {
                  type: 'text',
                  text: { content: minutes.rawTranscript.slice(0, 2000) }, // Notion has limits
                },
              ],
              language: 'plain text',
            },
          },
        ],
      },
    });

    // Metadata
    blocks.push({
      object: 'block',
      type: 'divider',
      divider: {},
    });
    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `🤖 生成日時: ${meetingDate}` },
            annotations: { italic: true, color: 'gray' },
          },
        ],
      },
    });

    return blocks;
  }

  /**
   * Update an existing meeting page
   */
  async updateMeetingPage(pageId: string, _updates: Partial<MeetingMinutes>): Promise<void> {
    // Implementation for updating existing pages
    // This would append new blocks or update properties
    await this.notion.pages.update({
      page_id: pageId,
      properties: {
        Status: {
          select: {
            name: 'Updated',
          },
        },
      },
    });
  }
}

/**
 * Project types for different Notion databases
 */
export type ProjectType = 'international' | 'programming' | 'art' | 'interview' | 'default';

/**
 * Get database ID for a specific project type
 */
export function getDatabaseIdForProject(projectType: ProjectType): string {
  const dbMap: Record<ProjectType, string | undefined> = {
    international: process.env.NOTION_INTERNATIONAL_DATABASE_ID,
    programming: process.env.NOTION_PROGRAMMING_DATABASE_ID,
    art: process.env.NOTION_ART_DATABASE_ID,
    interview: process.env.NOTION_INTERVIEW_DATABASE_ID,
    default: process.env.NOTION_MEETING_DATABASE_ID,
  };

  const databaseId = dbMap[projectType];

  if (!databaseId) {
    throw new Error(`Missing database ID for project type: ${projectType}`);
  }

  return databaseId;
}

/**
 * Create NotionService from environment variables
 */
export function createNotionServiceFromEnv(projectType: ProjectType = 'default'): NotionService {
  const apiKey = process.env.NOTION_API_KEY;

  if (!apiKey) {
    throw new Error('Missing NOTION_API_KEY');
  }

  const databaseId = getDatabaseIdForProject(projectType);

  return new NotionService(apiKey, databaseId);
}
