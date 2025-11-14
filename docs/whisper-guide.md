# Whisper API Integration Guide

AIMeet now supports OpenAI's Whisper API for audio transcription, allowing you to generate meeting minutes from audio files without requiring Google Workspace Pro plan.

## Overview

With Whisper API integration, you can:
- ✅ Transcribe audio files from any meeting (not just Google Meet)
- ✅ No Google Workspace Pro plan required
- ✅ Support for multiple audio formats (mp3, mp4, m4a, wav, webm, etc.)
- ✅ Cost-effective ($0.006 per minute)
- ✅ High accuracy with 90+ language support

## Prerequisites

1. **OpenAI API Key**
   - Sign up at [OpenAI Platform](https://platform.openai.com/)
   - Create an API key
   - Add to `.env`: `OPENAI_API_KEY=sk-...`

2. **Audio File**
   - Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm
   - Max file size: 25MB
   - For larger files, split them into smaller chunks

## Setup

### 1. Configure Environment Variables

Your `.env` file should already have:

```bash
# OpenAI (required for Whisper transcription)
OPENAI_API_KEY=sk-...

# Optional: Notion integration
NOTION_API_KEY=secret_...
NOTION_MEETING_DATABASE_ID=...

# Optional: Slack integration
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### 2. Verify Installation

```bash
npm run build
```

## Usage

### Basic Audio Transcription

Process a single audio file:

```bash
npm run process-meeting -- --audio path/to/meeting.mp3
```

### With Custom Template

Use NPO or government template:

```bash
npm run process-meeting -- --audio meeting.m4a --template npo
```

### Example Workflow

1. **Record your meeting** using any recording tool
   - Google Meet recording
   - Zoom recording
   - Local audio recorder
   - Phone voice memo

2. **Download the audio file** to your local machine

3. **Process the recording**:
   ```bash
   npm run process-meeting -- --audio ~/Downloads/team-meeting.m4a
   ```

4. **View the generated minutes** in the terminal, Notion (if configured), and Slack (if configured)

## Supported Audio Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| MP3 | `.mp3` | Most common, good compression |
| MP4 | `.mp4` | Video files with audio track |
| M4A | `.m4a` | Apple's audio format |
| WAV | `.wav` | Uncompressed, larger files |
| WebM | `.webm` | Modern web format |
| MPEG | `.mpeg` | Legacy format |
| MPGA | `.mpga` | Legacy MPEG audio |

## File Size Limits

Whisper API has a **25MB file size limit**. If your file is larger:

### Option 1: Compress the Audio
```bash
# Using ffmpeg (install via: brew install ffmpeg)
ffmpeg -i large-meeting.mp3 -b:a 64k compressed-meeting.mp3
```

### Option 2: Split the File
```bash
# Split into 20-minute chunks
ffmpeg -i long-meeting.mp3 -f segment -segment_time 1200 -c copy meeting_part_%03d.mp3
```

Then process each part separately (feature coming soon for automatic multi-file processing).

## Cost Estimation

Whisper API pricing: **$0.006 per minute**

| Meeting Duration | Estimated Cost |
|-----------------|----------------|
| 15 minutes | $0.09 |
| 30 minutes | $0.18 |
| 1 hour | $0.36 |
| 2 hours | $0.72 |

Calculate cost before processing:
```bash
# For a 45-minute meeting
# Cost = 45 × $0.006 = $0.27
```

## Recording Google Meet Without Pro Plan

If you don't have Google Workspace Pro, you can still record meetings:

### Option 1: Use Built-in Screen Recording (Mac)
1. Press `Cmd + Shift + 5`
2. Select "Record Selected Portion" or "Record Entire Screen"
3. Click "Options" → Select "Built-in Microphone"
4. Start recording before joining the meet
5. Stop recording after the meeting ends

### Option 2: Use OBS Studio (Free)
1. Download [OBS Studio](https://obsproject.com/)
2. Add "Audio Input Capture" source
3. Record the meeting audio
4. Export as MP3 or M4A

### Option 3: Use QuickTime (Mac)
1. Open QuickTime Player
2. File → New Audio Recording
3. Click the dropdown next to record button
4. Select your microphone
5. Record during the meeting

### Option 4: Use Audacity (Free, Cross-platform)
1. Download [Audacity](https://www.audacityteam.org/)
2. Select input device (microphone or system audio)
3. Click record
4. Export as MP3 when done

## Comparison: Google Meet API vs Whisper

| Feature | Google Meet API | Whisper API |
|---------|----------------|-------------|
| **Plan Required** | Workspace Business Standard+ | Any (Free Gmail OK) |
| **Cost** | Included in Workspace | $0.006/min |
| **File Needed** | No (automatic) | Yes (must record) |
| **Audio Quality** | Automatic | Depends on recording |
| **Speaker Diarization** | No | No |
| **Language Support** | Limited | 90+ languages |
| **Setup Complexity** | High (API + Admin) | Low (just API key) |

## Troubleshooting

### Error: "File size exceeds 25MB"
- Compress the audio file (see File Size Limits section)
- Split into smaller files
- Reduce audio quality/bitrate

### Error: "OPENAI_API_KEY is required"
- Make sure `.env` file exists in project root
- Verify `OPENAI_API_KEY=sk-...` is set correctly
- Restart the terminal after adding the key

### Error: "Unsupported audio format"
- Convert to a supported format:
  ```bash
  ffmpeg -i input.avi -vn -acodec libmp3lame output.mp3
  ```

### Poor Transcription Quality
- Ensure good audio quality when recording
- Reduce background noise
- Speak clearly and at moderate pace
- Use a good microphone

### Language Not Detected Correctly
- Specify language explicitly (feature coming soon):
  ```bash
  # Future feature
  npm run process-meeting -- --audio meeting.mp3 --language ja
  ```

## Advanced Usage

### Processing Multiple Files (Coming Soon)
```bash
# Future feature
npm run process-meeting -- --audio meeting-part1.mp3 meeting-part2.mp3 meeting-part3.mp3
```

### Custom Prompts (Coming Soon)
```bash
# Future feature - provide context to improve accuracy
npm run process-meeting -- --audio meeting.mp3 --prompt "This is a technical discussion about React and TypeScript"
```

## Best Practices

1. **Recording Quality**
   - Use a quality microphone
   - Minimize background noise
   - Ensure all participants are audible

2. **File Management**
   - Name files descriptively: `2024-11-13-board-meeting.mp3`
   - Keep original recordings as backup
   - Delete processed files after confirmation

3. **Cost Management**
   - Monitor your OpenAI API usage
   - Set usage limits in OpenAI dashboard
   - Compress audio when possible

4. **Privacy & Security**
   - Audio files are sent to OpenAI for processing
   - Do not record sensitive/confidential meetings without consent
   - Delete audio files after processing if they contain sensitive info

## Integration with Existing Workflow

Whisper API works seamlessly with existing AIMeet features:

```bash
# Phase 1: Use MCP Calendar Secretary to schedule meeting
# (In Claude Desktop) "Schedule a team meeting tomorrow at 2pm"

# Phase 2A: Attend meeting and record audio locally

# Phase 2B: Process with Whisper
npm run process-meeting -- --audio ~/Downloads/team-meeting.mp3

# Result: Automatic Notion page creation + Slack notification
```

## Future Enhancements

Planned features:
- [ ] Multi-file batch processing
- [ ] Language specification option
- [ ] Custom prompt support
- [ ] Speaker diarization (identify different speakers)
- [ ] Real-time transcription
- [ ] Automatic Google Drive integration
- [ ] Whisper local model support (no API cost)

## Resources

- [OpenAI Whisper API Documentation](https://platform.openai.com/docs/guides/speech-to-text)
- [Whisper Model Details](https://openai.com/research/whisper)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [OBS Studio Guide](https://obsproject.com/wiki/)

## Need Help?

If you encounter any issues:
1. Check this documentation
2. Verify your `.env` configuration
3. Ensure audio file is in supported format
4. Check OpenAI API key is valid and has credits
5. Open an issue on GitHub with error details
