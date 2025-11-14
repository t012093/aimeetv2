#!/bin/bash
# Simple wrapper script to record a meeting
# Usage: ./record-meeting.sh <meet-url> [output-file]

set -e

MEET_URL=$1
OUTPUT_FILE=${2:-"minutes-$(date +%Y%m%d-%H%M%S).txt"}

if [ -z "$MEET_URL" ]; then
  echo "Usage: ./record-meeting.sh <meet-url> [output-file]"
  echo ""
  echo "Examples:"
  echo "  ./record-meeting.sh https://meet.google.com/xxx-xxxx-xxx"
  echo "  ./record-meeting.sh https://meet.google.com/xxx-xxxx-xxx my-meeting.txt"
  exit 1
fi

echo "🎙️  Recording meeting: $MEET_URL"
echo "💾 Output will be saved to: $OUTPUT_FILE"
echo ""

cd "$(dirname "$0")"
npm run process-meeting -- --meetUrl "$MEET_URL" --output "$OUTPUT_FILE"
