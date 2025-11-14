#!/bin/bash
# Recall.ai Bot Recording Script
# Usage: ./record-bot.sh <meet-url> [output-file]

set -e

MEET_URL=$1
OUTPUT_FILE=${2:-"meeting.md"}

if [ -z "$MEET_URL" ]; then
  echo "❌ Usage: ./record-bot.sh <meet-url> [output-file]"
  echo ""
  echo "Examples:"
  echo "  ./record-bot.sh https://meet.google.com/abc-defg-hij"
  echo "  ./record-bot.sh https://meet.google.com/abc-defg-hij custom-meeting.md"
  echo ""
  echo "How it works:"
  echo "  1. Bot joins the meeting"
  echo "  2. Records video + audio"
  echo "  3. Generates transcript"
  echo "  4. Creates meeting minutes with AI"
  echo "  5. Saves to file"
  exit 1
fi

echo "🤖 AIMeet - Recall.ai Bot Recording"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 Meeting URL: $MEET_URL"
echo "💾 Output: Record/YYYY/MM/$OUTPUT_FILE"
echo ""
echo "⏳ Sending bot to meeting..."
echo "   (The bot will appear as 'AIMeet Recorder')"
echo "   Please approve the bot when it joins!"
echo ""

cd "$(dirname "$0")"
npm run process-meeting -- --meetUrl "$MEET_URL" --output "$OUTPUT_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Done! Minutes saved to: $OUTPUT_FILE"
