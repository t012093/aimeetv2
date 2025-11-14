import { RecallService } from './src/services/recall.js';

async function main() {
  const service = new RecallService({
    apiKey: '50a33f5c81664b710e080b81fc9ffcbcd683b396',
    region: 'us-west-2'
  });

  const botId = '1cae48d7-c234-4a55-ad74-060a9b1e6ab7';

  console.log('📝 Fetching transcript with fixed parser...\n');

  const transcript = await service.getTranscript(botId);

  console.log('=== Transcript Summary ===');
  console.log(`Total words: ${transcript.words.length}`);

  if (transcript.words.length > 0) {
    console.log('\n=== First 5 entries ===');
    transcript.words.slice(0, 5).forEach((word, i) => {
      console.log(`${i + 1}. [${word.start_time.toFixed(1)}s] ${word.speaker}: ${word.text}`);
    });

    console.log('\n=== Formatted Text ===');
    const formattedText = service.formatTranscriptText(transcript, false);
    console.log(formattedText);
  }
}

main().catch(console.error);
