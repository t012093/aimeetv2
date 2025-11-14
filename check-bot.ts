import { RecallService } from './src/services/recall.js';

async function main() {
  const service = new RecallService({
    apiKey: '50a33f5c81664b710e080b81fc9ffcbcd683b396',
    region: 'us-west-2'
  });

  const botId = '9f8194ac-56aa-41b1-b30a-c9f0a86dc4e7';

  console.log('🔍 Checking bot status...\n');

  const bot = await service.getBot(botId);

  console.log('=== Bot Information ===');
  console.log(`Bot ID: ${bot.id}`);
  console.log(`Meeting URL: ${bot.meeting_url.platform} - ${bot.meeting_url.meeting_id}`);
  console.log('');

  console.log('=== Status History ===');
  bot.status_changes.forEach((status, i) => {
    console.log(`${i + 1}. ${status.code} - ${status.created_at}`);
    if (status.sub_code) console.log(`   Sub-code: ${status.sub_code}`);
  });
  console.log('');

  const currentStatus = bot.status_changes[bot.status_changes.length - 1];
  console.log(`Current Status: ${currentStatus.code}`);
  console.log('');

  console.log('=== Recordings ===');
  if (bot.recordings && bot.recordings.length > 0) {
    const rec = bot.recordings[0];
    console.log(`Recording ID: ${rec.id}`);
    console.log(`Status: ${rec.status.code}`);
    console.log(`Started: ${rec.started_at}`);
    console.log(`Completed: ${rec.completed_at || 'N/A'}`);
    console.log('');

    if (rec.media_shortcuts?.transcript) {
      const transcript = rec.media_shortcuts.transcript;
      console.log('Transcript:');
      console.log(`  ID: ${transcript.id}`);
      console.log(`  Status: ${transcript.status.code}`);
      console.log(`  Has download_url: ${!!transcript.data?.download_url}`);

      if (transcript.data?.download_url) {
        console.log(`  URL: ${transcript.data.download_url.substring(0, 80)}...`);
      }
    } else {
      console.log('❌ No transcript found in media_shortcuts');
    }

    if (rec.media_shortcuts?.video_mixed) {
      const video = rec.media_shortcuts.video_mixed;
      console.log('');
      console.log('Video:');
      console.log(`  ID: ${video.id}`);
      console.log(`  Status: ${video.status.code}`);
      console.log(`  Has download_url: ${!!video.data?.download_url}`);
    }
  } else {
    console.log('❌ No recordings found');
  }

  console.log('');
  console.log('=== Full Response ===');
  console.log(JSON.stringify(bot, null, 2));
}

main().catch(console.error);
