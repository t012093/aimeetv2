#!/usr/bin/env node
/**
 * Send Recall.ai bot to meeting (non-blocking)
 * Returns bot ID immediately, doesn't wait for completion
 *
 * Usage:
 *   npx tsx src/scripts/send-bot.ts <meet-url>
 *   npx tsx src/scripts/send-bot.ts https://meet.google.com/xxx-xxxx-xxx
 */

import { createRecallServiceFromEnv } from '../services/recall.js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function main() {
  const meetUrl = process.argv[2];

  if (!meetUrl) {
    console.error('Usage: npx tsx src/scripts/send-bot.ts <meet-url>');
    process.exit(1);
  }

  if (!process.env.RECALL_API_KEY) {
    console.error('❌ RECALL_API_KEY is not set in .env');
    process.exit(1);
  }

  console.log('🤖 AIMeet - Send Bot to Meeting\n');
  console.log(`📍 Meeting URL: ${meetUrl}`);
  console.log('');

  const recallService = createRecallServiceFromEnv();

  console.log('⏳ Creating bot...');
  const bot = await recallService.createBot({
    meetingUrl: meetUrl,
    botName: 'AIMeet Recorder',
    transcriptionProvider: 'recallai_streaming',
    transcriptionLanguage: 'ja',
    transcriptionMode: 'prioritize_accuracy',
  });

  console.log('');
  console.log('✅ Bot created successfully!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 Bot Information');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`   Bot ID: ${bot.id}`);
  console.log(`   Status: ${bot.status_changes[bot.status_changes.length - 1]?.code}`);
  console.log('');
  console.log('📝 Next Steps:');
  console.log('   1. Join the meeting');
  console.log('   2. Approve "AIMeet Recorder" bot');
  console.log('   3. Conduct your meeting');
  console.log('   4. After meeting ends, process the recording:');
  console.log('');
  console.log(`      npm run process-meeting -- --bot ${bot.id} --output minutes.txt`);
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Save bot ID to .last-bot file
  try {
    fs.writeFileSync('.last-bot', bot.id, 'utf-8');
    console.log('');
    console.log('💡 Bot ID saved! After meeting, simply run: ./finish');
  } catch (error) {
    console.log('');
    console.log('💡 Tip: Save the Bot ID above for later processing!');
  }
}

main().catch(error => {
  console.error('\n❌ Error:', error.message);
  process.exit(1);
});
