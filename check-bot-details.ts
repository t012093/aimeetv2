import { RecallService } from './src/services/recall.js';

async function main() {
  const service = new RecallService({
    apiKey: '50a33f5c81664b710e080b81fc9ffcbcd683b396',
    region: 'us-west-2'
  });

  const botId = '1cae48d7-c234-4a55-ad74-060a9b1e6ab7';
  const bot = await service.getBot(botId);

  console.log('=== Bot Details ===');
  console.log(JSON.stringify(bot, null, 2));

  console.log('\n=== Status History ===');
  bot.status_changes.forEach((status, i) => {
    console.log(`${i + 1}. ${status.code} - ${status.created_at}`);
  });

  console.log('\n=== Recordings ===');
  if (bot.recordings && bot.recordings.length > 0) {
    const rec = bot.recordings[0];
    console.log('Video URL:', rec.video?.download_url || 'N/A');
    console.log('Transcript ID:', rec.media_shortcuts?.transcript?.id || 'N/A');
    console.log('Transcript URL:', rec.media_shortcuts?.transcript?.data?.download_url || 'N/A');
  } else {
    console.log('No recordings found');
  }
}

main().catch(console.error);
