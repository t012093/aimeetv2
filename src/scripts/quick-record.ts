#!/usr/bin/env node
/**
 * Quick Record - Simplified interface for recording meetings
 *
 * Usage:
 *   npx tsx src/scripts/quick-record.ts
 *   (Interactive prompts will guide you)
 */

import { createAuthServiceFromEnv } from '../services/google-auth.js';
import { CalendarService } from '../services/calendar.js';
import { createMinutesGeneratorFromEnv } from '../processors/minutes-generator.js';
import { createOrchestratorFromEnv } from '../processors/meeting-orchestrator.js';
import dotenv from 'dotenv';
import * as readline from 'readline';
import * as fs from 'fs';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log('🎙️  AIMeet Quick Record\n');
  console.log('='.repeat(60));
  console.log('');

  // Check if Recall.ai is configured
  if (!process.env.RECALL_API_KEY) {
    console.log('⚠️  Recall.ai is not configured.');
    console.log('Please set RECALL_API_KEY in .env file.');
    console.log('');
    const useAudio = await question('Do you want to use audio file instead? (y/n): ');

    if (useAudio.toLowerCase() === 'y') {
      const audioPath = await question('Enter audio file path: ');
      const outputPath = await question('Output file (default: minutes.txt): ') || 'minutes.txt';

      rl.close();

      console.log('\n📝 Processing audio file...\n');

      const authService = createAuthServiceFromEnv();
      const minutesGenerator = createMinutesGeneratorFromEnv();
      const orchestrator = await createOrchestratorFromEnv(authService, minutesGenerator);

      const result = await orchestrator.processMeeting({
        audioFilePath: audioPath,
      });

      await saveResult(result, outputPath);
      console.log('\n✅ Done!');
      return;
    } else {
      rl.close();
      process.exit(1);
    }
  }

  // Choose method
  console.log('Choose recording method:');
  console.log('1. 📅 Upcoming calendar event');
  console.log('2. 🔗 Meeting URL');
  console.log('3. 🎵 Audio file');
  console.log('');

  const choice = await question('Enter choice (1-3): ');

  if (choice === '1') {
    // Calendar event
    await handleCalendarEvent();
  } else if (choice === '2') {
    // Meeting URL
    await handleMeetingUrl();
  } else if (choice === '3') {
    // Audio file
    await handleAudioFile();
  } else {
    console.log('Invalid choice');
    rl.close();
    process.exit(1);
  }

  console.log('\n✅ Done!');
  rl.close();
}

async function handleCalendarEvent() {
  console.log('\n📅 Fetching upcoming events...\n');

  const authService = createAuthServiceFromEnv();
  const isAuth = await authService.isAuthenticated();

  if (!isAuth) {
    console.log('❌ Not authenticated. Run: npm run auth');
    process.exit(1);
  }

  const calendarService = new CalendarService(authService.getClient());
  const events = await calendarService.getUpcomingEvents(5);

  if (events.length === 0) {
    console.log('No upcoming events found.');
    return;
  }

  console.log('Upcoming events:');
  events.forEach((event, idx) => {
    const start = new Date(event.start).toLocaleString('ja-JP');
    console.log(`${idx + 1}. ${event.summary} (${start})`);
    if (event.meetLink) {
      console.log(`   Meet: ${event.meetLink}`);
    }
  });
  console.log('');

  const selection = await question('Select event (1-5): ');
  const selectedIdx = parseInt(selection) - 1;

  if (selectedIdx < 0 || selectedIdx >= events.length) {
    console.log('Invalid selection');
    return;
  }

  const selectedEvent = events[selectedIdx];

  if (!selectedEvent.meetLink) {
    console.log('❌ This event does not have a Meet link');
    return;
  }

  const outputPath = await question('Output file (default: minutes.txt): ') || 'minutes.txt';

  console.log('\n🤖 Sending bot to meeting...\n');

  const minutesGenerator = createMinutesGeneratorFromEnv();
  const orchestrator = await createOrchestratorFromEnv(authService, minutesGenerator);

  const result = await orchestrator.processMeeting({
    meetingUrl: selectedEvent.meetLink,
    waitForCompletion: true,
  });

  await saveResult(result, outputPath);
}

async function handleMeetingUrl() {
  const meetUrl = await question('\n🔗 Enter Google Meet URL: ');
  const outputPath = await question('Output file (default: minutes.txt): ') || 'minutes.txt';

  console.log('\n🤖 Sending bot to meeting...\n');

  const authService = createAuthServiceFromEnv();
  const minutesGenerator = createMinutesGeneratorFromEnv();
  const orchestrator = await createOrchestratorFromEnv(authService, minutesGenerator);

  const result = await orchestrator.processMeeting({
    meetingUrl: meetUrl,
    waitForCompletion: true,
  });

  await saveResult(result, outputPath);
}

async function handleAudioFile() {
  const audioPath = await question('\n🎵 Enter audio file path: ');
  const outputPath = await question('Output file (default: minutes.txt): ') || 'minutes.txt';

  console.log('\n📝 Processing audio file...\n');

  const authService = createAuthServiceFromEnv();
  const minutesGenerator = createMinutesGeneratorFromEnv();
  const orchestrator = await createOrchestratorFromEnv(authService, minutesGenerator);

  const result = await orchestrator.processMeeting({
    audioFilePath: audioPath,
  });

  await saveResult(result, outputPath);
}

async function saveResult(result: any, outputPath: string) {
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

  lines.push('\n' + '='.repeat(60));

  const output = lines.join('\n');

  // Print to console
  console.log(output);

  // Save to file
  const fullOutput = output + '\n\n' + '='.repeat(60) + '\n' +
    '📄 RAW DATA (JSON)\n' +
    '='.repeat(60) + '\n' +
    JSON.stringify(result.minutes, null, 2);

  fs.writeFileSync(outputPath, fullOutput, 'utf-8');
  console.log(`\n💾 Saved to: ${outputPath}`);
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  rl.close();
  process.exit(1);
});
