#!/usr/bin/env node
/**
 * CLI tool to process a meeting and generate minutes
 * Usage:
 *   npm run process-meeting -- --conference conferenceRecords/abc-defg
 *   npm run process-meeting -- --event my-calendar-event-id
 *   npm run process-meeting -- --recent
 */

import { createAuthServiceFromEnv } from '../services/google-auth.js';
import { createMinutesGeneratorFromEnv } from '../processors/minutes-generator.js';
import { createGeminiMinutesGeneratorFromEnv } from '../processors/minutes-generator-gemini.js';
import { createClaudeMinutesGeneratorFromEnv } from '../processors/minutes-generator-claude.js';
import { createOrchestratorFromEnv } from '../processors/meeting-orchestrator.js';
import { MeetService } from '../services/meet.js';
import dotenv from 'dotenv';
import { parseArgs } from 'util';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

async function main() {
  const { values } = parseArgs({
    options: {
      conference: {
        type: 'string',
        short: 'c',
      },
      event: {
        type: 'string',
        short: 'e',
      },
      recent: {
        type: 'boolean',
        short: 'r',
      },
      audio: {
        type: 'string',
        short: 'a',
      },
      bot: {
        type: 'string',
        short: 'b',
      },
      meetUrl: {
        type: 'string',
        short: 'm',
      },
      template: {
        type: 'string',
        short: 't',
        default: 'default',
      },
      project: {
        type: 'string',
        short: 'p',
        default: 'default',
      },
      list: {
        type: 'boolean',
        short: 'l',
      },
      output: {
        type: 'string',
        short: 'o',
      },
    },
    allowPositionals: true,
  });

  console.log('🚀 AIMeet - Meeting Processor\n');

  // Setup services
  let authService = null;
  let meetService = null;

  // Google authentication is optional if using Whisper with audio files
  if (!values.audio) {
    authService = createAuthServiceFromEnv();
    const isAuth = await authService.isAuthenticated();

    if (!isAuth) {
      console.error('❌ Not authenticated. Run: npm run auth');
      process.exit(1);
    }

    meetService = new MeetService(authService.getClient());
  }

  // Select AI provider based on AI_PROVIDER env variable
  const aiProvider = process.env.AI_PROVIDER || 'openai';
  let minutesGenerator;

  if (aiProvider === 'claude') {
    minutesGenerator = createClaudeMinutesGeneratorFromEnv();
  } else if (aiProvider === 'gemini') {
    minutesGenerator = createGeminiMinutesGeneratorFromEnv();
  } else {
    minutesGenerator = createMinutesGeneratorFromEnv();
  }

  console.log(`🤖 Using AI provider: ${aiProvider}\n`);

  const projectType = values.project as string || 'default';
  if (projectType !== 'default') {
    console.log(`📁 Using project database: ${projectType}\n`);
  }

  const orchestrator = await createOrchestratorFromEnv(authService, minutesGenerator, projectType);

  // List conferences
  if (values.list) {
    if (!meetService) {
      console.error('❌ --list requires Google authentication. Run: npm run auth');
      process.exit(1);
    }

    console.log('📋 Recent conference records:\n');
    const conferences = await meetService.listConferenceRecords(10);

    if (conferences.length === 0) {
      console.log('No conferences found.');
      return;
    }

    conferences.forEach((conf, idx) => {
      console.log(`${idx + 1}. ${conf.name}`);
      console.log(`   Started: ${new Date(conf.startTime).toLocaleString('ja-JP')}`);
      if (conf.endTime) {
        console.log(`   Ended: ${new Date(conf.endTime).toLocaleString('ja-JP')}`);
      }
      console.log('');
    });

    return;
  }

  // Process specific conference
  if (values.conference) {
    console.log(`Processing conference: ${values.conference}\n`);

    const result = await orchestrator.processMeeting({
      conferenceRecordName: values.conference,
      templateName: values.template as any,
    });

    displayResult(result);
    return;
  }

  // Process by calendar event
  if (values.event) {
    console.log(`Processing by calendar event: ${values.event}\n`);

    const result = await orchestrator.processMostRecentMeeting(
      values.event,
      values.template as any
    );

    displayResult(result);
    return;
  }

  // Process with Recall.ai bot (by bot ID)
  if (values.bot) {
    console.log(`Processing with Recall.ai bot: ${values.bot}\n`);

    if (!process.env.RECALL_API_KEY) {
      console.error('❌ RECALL_API_KEY is required for Recall.ai bot');
      process.exit(1);
    }

    const result = await orchestrator.processMeeting({
      botId: values.bot,
      templateName: values.template as any,
    });

    displayResult(result);

    if (values.output) {
      await saveResultToFile(result, values.output);
    }

    return;
  }

  // Send bot to meeting URL
  if (values.meetUrl) {
    console.log(`Sending bot to meeting: ${values.meetUrl}\n`);

    if (!process.env.RECALL_API_KEY) {
      console.error('❌ RECALL_API_KEY is required for Recall.ai bot');
      process.exit(1);
    }

    const result = await orchestrator.processMeeting({
      meetingUrl: values.meetUrl,
      waitForCompletion: true,
      templateName: values.template as any,
    });

    displayResult(result);

    if (values.output) {
      await saveResultToFile(result, values.output);
    }

    return;
  }

  // Process audio file with Whisper
  if (values.audio) {
    console.log(`Processing audio file: ${values.audio}\n`);

    if (!process.env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY is required for audio transcription');
      process.exit(1);
    }

    const result = await orchestrator.processMeeting({
      audioFilePath: values.audio,
      templateName: values.template as any,
    });

    displayResult(result);
    return;
  }

  // Process most recent
  if (values.recent) {
    if (!meetService) {
      console.error('❌ --recent requires Google authentication. Run: npm run auth');
      process.exit(1);
    }

    console.log('Processing most recent conference...\n');

    const conferences = await meetService.listConferenceRecords(1);

    if (conferences.length === 0) {
      console.error('❌ No conferences found');
      process.exit(1);
    }

    const result = await orchestrator.processMeeting({
      conferenceRecordName: conferences[0].name,
      templateName: values.template as any,
    });

    displayResult(result);
    return;
  }

  // No arguments - show help
  console.log('Usage:');
  console.log('  --list, -l              List recent conferences (requires Google auth)');
  console.log('  --conference, -c <id>   Process specific conference (requires Google auth)');
  console.log('  --event, -e <id>        Process by calendar event ID (requires Google auth)');
  console.log('  --recent, -r            Process most recent conference (requires Google auth)');
  console.log('  --audio, -a <file>      Process audio file with Whisper API');
  console.log('  --meetUrl, -m <url>     Send Recall.ai bot to meeting URL');
  console.log('  --bot, -b <id>          Process with existing Recall.ai bot ID');
  console.log('  --template, -t <name>   Template: default, npo, government');
  console.log('  --output, -o <file>     Save output to file (.txt or .md)');
  console.log('\nExamples:');
  console.log('  npm run process-meeting -- --list');
  console.log('  npm run process-meeting -- --recent');
  console.log('  npm run process-meeting -- --conference conferenceRecords/abc');
  console.log('  npm run process-meeting -- --event my-event-id --template npo');
  console.log('  npm run process-meeting -- --audio meeting.mp3');
  console.log('  npm run process-meeting -- --meetUrl https://meet.google.com/xxx-xxxx-xxx');
  console.log('  npm run process-meeting -- --bot bot_abc123def456');
  console.log('  npm run process-meeting -- --meetUrl <url> --output minutes.md');
  console.log('  npm run process-meeting -- --bot bot_123 --output minutes.md');
  console.log('  npm run process-meeting -- --recent --output output/meeting-{timestamp}.md');
}

function displayResult(result: any) {
  const output = formatResult(result);
  console.log(output);
}

function formatResultAsMarkdown(result: any): string {
  const lines: string[] = [];
  const date = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' });
  const time = new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

  // Header with emoji
  lines.push('# 📋 会議議事録\n');
  lines.push(`**📅 日付**: ${date} ${time}`);

  if (result.minutes.participants && result.minutes.participants.length > 0) {
    lines.push(`**👥 参加者**: ${result.minutes.participants.join(', ')}`);
  }
  lines.push('');

  // Summary
  lines.push('## 📝 概要\n');
  lines.push(result.minutes.summary + '\n');

  // Key Points
  if (result.minutes.keyPoints && result.minutes.keyPoints.length > 0) {
    lines.push('## 💡 重要なポイント\n');
    result.minutes.keyPoints.forEach((point: string) => {
      lines.push(`- ✨ ${point}`);
    });
    lines.push('');
  }

  // Decisions
  if (result.minutes.decisions && result.minutes.decisions.length > 0) {
    lines.push('## ✅ 決定事項\n');
    result.minutes.decisions.forEach((decision: string) => {
      lines.push(`- ✔️ ${decision}`);
    });
    lines.push('');
  }

  // Action Items with Table
  if (result.minutes.actionItems && result.minutes.actionItems.length > 0) {
    lines.push('## 🎯 アクションアイテム\n');
    lines.push('| 優先度 | タスク | 担当者 | 期限 | 状態 |');
    lines.push('|:------:|:-------|:------:|:----:|:----:|');

    result.minutes.actionItems.forEach((item: any) => {
      const priorityEmoji = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
      const task = item.description || item.task || '';
      const owner = item.owner || '-';
      const deadline = item.deadline || '-';
      lines.push(`| ${priorityEmoji} | ${task} | ${owner} | ${deadline} | ⬜ |`);
    });
    lines.push('');
  }

  // Unresolved Issues
  if (result.minutes.unresolvedIssues && result.minutes.unresolvedIssues.length > 0) {
    lines.push('## ⚠️ 未解決事項\n');
    lines.push('> 以下の事項については会議中に結論が出ませんでした。次回の議論が必要です。\n');

    result.minutes.unresolvedIssues.forEach((issue: any, index: number) => {
      const priorityEmoji = issue.priority === 'high' ? '🔴' : issue.priority === 'medium' ? '🟡' : '🟢';
      lines.push(`### ${priorityEmoji} ${index + 1}. ${issue.issue}\n`);
      lines.push(`**📌 背景**: ${issue.context}\n`);
      if (issue.suggestedAction) {
        lines.push(`**💡 推奨アクション**: ${issue.suggestedAction}\n`);
      }
    });
  }

  // AI Suggestions
  if (result.minutes.aiSuggestions && result.minutes.aiSuggestions.length > 0) {
    lines.push('## 🤖 AIからの提案・アドバイス\n');
    lines.push('> AIが会議内容を分析し、以下の提案をします。\n');

    const categoryEmoji: any = {
      'process': '⚙️',
      'decision': '🎯',
      'risk': '⚠️',
      'opportunity': '🌟',
      'resource': '📦'
    };

    result.minutes.aiSuggestions.forEach((suggestion: any, index: number) => {
      const emoji = categoryEmoji[suggestion.category] || '💡';
      const priorityBadge = suggestion.priority === 'high' ? '**[重要]**' : suggestion.priority === 'medium' ? '*[中]*' : '[低]';

      lines.push(`### ${emoji} ${index + 1}. ${suggestion.suggestion} ${priorityBadge}\n`);
      lines.push(`**理由**: ${suggestion.reasoning}\n`);
    });
  }

  // Risks with Table
  if (result.minutes.risks && result.minutes.risks.length > 0) {
    lines.push('## ⚡ リスク分析\n');
    lines.push('| リスク | 影響度 | 発生確率 | 軽減策 |');
    lines.push('|:-------|:------:|:--------:|:-------|');

    result.minutes.risks.forEach((risk: any) => {
      const impact = risk.impact === 'high' ? '🔴 高' : risk.impact === 'medium' ? '🟡 中' : '🟢 低';
      const likelihood = risk.likelihood === 'high' ? '🔴 高' : risk.likelihood === 'medium' ? '🟡 中' : '🟢 低';
      const mitigation = risk.mitigation || '-';
      lines.push(`| ${risk.risk} | ${impact} | ${likelihood} | ${mitigation} |`);
    });
    lines.push('');
  }

  // Timeline with Mermaid Gantt Chart
  if (result.minutes.timeline && result.minutes.timeline.length > 0) {
    lines.push('## 📅 タイムライン\n');
    lines.push('```mermaid');
    lines.push('gantt');
    lines.push('    title プロジェクトタイムライン');
    lines.push('    dateFormat YYYY-MM-DD');
    lines.push('    section マイルストーン');

    result.minutes.timeline.forEach((entry: any) => {
      const status = entry.status === 'completed' ? 'done' : entry.status === 'in-progress' ? 'active' : 'crit';
      const deadline = entry.deadline || '2025-12-31';
      lines.push(`    ${entry.milestone} :${status}, ${deadline}, 1d`);
    });

    lines.push('```\n');
  }

  // Next Steps
  if (result.minutes.nextSteps && result.minutes.nextSteps.length > 0) {
    lines.push('## 🚀 次のステップ\n');
    result.minutes.nextSteps.forEach((step: string, index: number) => {
      lines.push(`${index + 1}. ${step}`);
    });
    lines.push('');
  }

  // Process Flow (if applicable)
  if (result.minutes.actionItems && result.minutes.actionItems.length > 2) {
    lines.push('## 🔄 アクションフロー\n');
    lines.push('```mermaid');
    lines.push('graph TD');
    lines.push('    A[会議終了] --> B{アクションアイテム}');

    result.minutes.actionItems.slice(0, 5).forEach((item: any, index: number) => {
      const nodeId = String.fromCharCode(67 + index); // C, D, E...
      const task = (item.description || item.task || '').substring(0, 30);
      lines.push(`    B --> ${nodeId}[${task}]`);
    });

    lines.push('    C --> Z[完了]');
    lines.push('    D --> Z');
    lines.push('    E --> Z');
    lines.push('```\n');
  }

  // Next Meeting Agenda Link
  if (result.agendaFile) {
    lines.push('---\n');
    lines.push(`## 📅 次回会議のアジェンダ\n`);
    lines.push(`次回会議のアジェンダが自動生成されました：\n`);
    lines.push(`👉 **[次回アジェンダを開く](../${result.agendaFile})**\n`);
  }

  // Errors/Warnings
  if (result.errors && result.errors.length > 0) {
    lines.push('## ⚠️ エラー・警告\n');
    result.errors.forEach((err: string) => {
      lines.push(`- ❌ ${err}`);
    });
    lines.push('');
  }

  return lines.join('\n');
}

function formatResult(result: any): string {
  const lines: string[] = [];

  lines.push('\n' + '='.repeat(60));
  lines.push('📋 MEETING MINUTES');
  lines.push('='.repeat(60) + '\n');

  lines.push('📝 概要:');
  lines.push(result.minutes.summary + '\n');

  if (result.minutes.keyPoints.length > 0) {
    lines.push('💡 重要なポイント:');
    result.minutes.keyPoints.forEach((point: string) => {
      lines.push(`  • ${point}`);
    });
    lines.push('');
  }

  if (result.minutes.decisions.length > 0) {
    lines.push('✅ 決定事項:');
    result.minutes.decisions.forEach((decision: string) => {
      lines.push(`  • ${decision}`);
    });
    lines.push('');
  }

  if (result.minutes.actionItems.length > 0) {
    lines.push('🎯 アクションアイテム:');
    result.minutes.actionItems.forEach((item: any) => {
      const priority = item.priority === 'high' ? '🔴' : item.priority === 'medium' ? '🟡' : '🟢';
      const owner = item.owner ? ` (${item.owner})` : '';
      const deadline = item.deadline ? ` [${item.deadline}]` : '';
      lines.push(`  ${priority} ${item.task}${owner}${deadline}`);
    });
    lines.push('');
  }

  if (result.notionUrl) {
    lines.push(`📝 Notion: ${result.notionUrl}`);
  }

  if (result.slackPosted) {
    lines.push('📢 Slack: Posted');
  }

  if (result.errors.length > 0) {
    lines.push('\n⚠️  Errors:');
    result.errors.forEach((err: string) => {
      lines.push(`  • ${err}`);
    });
  }

  lines.push('\n' + '='.repeat(60));

  return lines.join('\n');
}

async function saveAgendaFile(agenda: any, timestamp: Date): Promise<string> {
  const year = timestamp.getFullYear();
  const month = String(timestamp.getMonth() + 1).padStart(2, '0');
  const agendaDir = path.join('Agenda', String(year), month);
  fs.mkdirSync(agendaDir, { recursive: true });

  const fileTimestamp = timestamp.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '-');
  const filename = path.join(agendaDir, `agenda-${fileTimestamp}.md`);

  const lines: string[] = [];
  const dateStr = agenda.suggestedDate || '未定';
  const duration = agenda.suggestedDuration || 60;

  lines.push('# 📅 次回会議アジェンダ\n');
  lines.push(`**🗓️ 予定日時**: ${dateStr}`);
  lines.push(`**⏱️ 予定時間**: ${duration}分\n`);

  lines.push('## 🎯 会議の目的\n');
  agenda.objectives.forEach((obj: string) => {
    lines.push(`- ${obj}`);
  });
  lines.push('');

  lines.push('## 👥 参加者\n');
  lines.push('### 必須参加者\n');
  agenda.requiredParticipants.forEach((p: string) => {
    lines.push(`- ✅ ${p}`);
  });

  if (agenda.optionalParticipants && agenda.optionalParticipants.length > 0) {
    lines.push('\n### 任意参加者\n');
    agenda.optionalParticipants.forEach((p: string) => {
      lines.push(`- 🔹 ${p}`);
    });
  }
  lines.push('');

  lines.push('## 📋 議題\n');
  let totalDuration = 0;
  agenda.topics.forEach((topic: any, index: number) => {
    totalDuration += topic.estimatedDuration;
    lines.push(`### ${index + 1}. ${topic.title} (${topic.estimatedDuration}分)\n`);
    lines.push(`**説明**: ${topic.description}\n`);
    if (topic.presenter) {
      lines.push(`**担当**: ${topic.presenter}\n`);
    }
    if (topic.materials && topic.materials.length > 0) {
      lines.push(`**必要資料**:`);
      topic.materials.forEach((m: string) => {
        lines.push(`- 📄 ${m}`);
      });
      lines.push('');
    }
  });

  lines.push(`**合計予定時間**: ${totalDuration}分\n`);

  if (agenda.preparationItems && agenda.preparationItems.length > 0) {
    lines.push('## 📝 事前準備事項\n');
    agenda.preparationItems.forEach((item: string, index: number) => {
      lines.push(`${index + 1}. [ ] ${item}`);
    });
    lines.push('');
  }

  lines.push('## 📅 タイムテーブル\n');
  lines.push('```mermaid');
  lines.push('gantt');
  lines.push('    title 会議タイムテーブル');
  lines.push('    dateFormat HH:mm');
  lines.push('    axisFormat %H:%M');
  let currentTime = 0;
  agenda.topics.forEach((topic: any) => {
    const startTime = String(Math.floor(currentTime / 60)).padStart(2, '0') + ':' +
      String(currentTime % 60).padStart(2, '0');
    currentTime += topic.estimatedDuration;
    const endTime = String(Math.floor(currentTime / 60)).padStart(2, '0') + ':' +
      String(currentTime % 60).padStart(2, '0');
    lines.push(`    ${topic.title} :${startTime}, ${endTime}`);
  });
  lines.push('```\n');

  lines.push('---\n');
  lines.push('*このアジェンダは前回の会議内容から自動生成されました*');

  fs.writeFileSync(filename, lines.join('\n'), 'utf-8');
  return filename;
}

async function saveResultToFile(result: any, outputPath: string) {
  try {
    const now = new Date();
    const timestamp = now.toISOString().replace(/[:.]/g, '-');
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');

    const dir = path.dirname(outputPath);
    const ext = path.extname(outputPath);
    const basename = path.basename(outputPath, ext);

    let filename: string;

    // If path includes directory, use as-is
    if (dir && dir !== '.') {
      fs.mkdirSync(dir, { recursive: true });
      filename = outputPath.includes('{timestamp}')
        ? outputPath.replace('{timestamp}', timestamp)
        : ext
          ? outputPath
          : `${basename}-${timestamp}.md`;
    } else {
      // Default: save to Record/YYYY/MM/ with timestamp
      const recordDir = path.join('Record', String(year), month);
      fs.mkdirSync(recordDir, { recursive: true });

      const defaultExt = ext || '.md';
      const defaultBasename = basename || 'meeting';
      const fileTimestamp = now.toISOString().slice(0, 19).replace(/:/g, '-').replace('T', '-');

      filename = path.join(recordDir, `${defaultBasename}-${fileTimestamp}${defaultExt}`);
    }

    // Generate agenda file if nextMeetingAgenda exists
    if (result.minutes.nextMeetingAgenda) {
      const agendaFile = await saveAgendaFile(result.minutes.nextMeetingAgenda, now);
      result.agendaFile = agendaFile;
      console.log(`\n📅 Next meeting agenda saved to: ${agendaFile}`);
    }

    // Determine format based on extension
    const isMarkdown = filename.endsWith('.md');

    // Format output
    const output = isMarkdown ? formatResultAsMarkdown(result) : formatResult(result);

    // Add JSON section
    const fullOutput = output + '\n\n' +
      (isMarkdown ? '---\n\n## Raw Data (JSON)\n\n```json\n' : '='.repeat(60) + '\n📄 RAW DATA (JSON)\n' + '='.repeat(60) + '\n') +
      JSON.stringify(result.minutes, null, 2) +
      (isMarkdown ? '\n```\n' : '');

    // Save to file
    fs.writeFileSync(filename, fullOutput, 'utf-8');

    console.log(`\n💾 Output saved to: ${filename}`);
  } catch (error: any) {
    console.error(`\n❌ Failed to save output: ${error.message}`);
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
