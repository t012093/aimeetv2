# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-11-14

### Added - Whisper API Integration 🎙️

**Major Feature: Audio File Transcription**

- ✅ **Whisper API Support** - Process meeting audio files without Google Workspace Pro plan
  - OpenAI Whisper integration for high-quality transcription
  - Support for multiple audio formats (mp3, mp4, m4a, wav, webm)
  - 90+ languages supported
  - Cost-effective at $0.006/minute

- ✅ **New CLI Command**
  ```bash
  npm run process-meeting -- --audio meeting.mp3
  ```

- ✅ **Enhanced Meeting Orchestrator**
  - Supports both Google Meet API and Whisper API
  - Automatic method selection based on input
  - Works without Google authentication when using audio files

- ✅ **WhisperService** (`src/services/whisper.ts`)
  - Audio file transcription with timestamps
  - Multi-file processing support
  - File size validation (25MB limit)
  - Cost estimation utilities
  - Automatic language detection

### Changed

- **MeetingOrchestrator** - Now accepts audio file paths as input
- **process-meeting CLI** - Made Google authentication optional when using Whisper
- **README** - Updated with Whisper integration information
- **Documentation** - Added comprehensive Whisper integration guide

### Documentation

- 📚 **New Guide**: [Whisper Integration Guide](docs/whisper-guide.md)
  - Setup instructions
  - Recording methods for free plans
  - Troubleshooting
  - Cost calculator
  - Best practices

### Benefits

🎯 **No Google Workspace Pro Required**
- Use with free Gmail accounts
- Record meetings with any tool
- Process local audio files

💰 **Cost Effective**
- $0.006 per minute (Whisper API)
- Much cheaper than Workspace upgrade
- Pay-per-use model

🌍 **Flexible & Universal**
- Works with any meeting platform (Zoom, Teams, etc.)
- Process pre-recorded meetings
- Offline processing capability

---

## [0.1.0] - 2024-11-13

### Added - Initial Release

**Phase 1: MCP Calendar Secretary** ✅
- Google Calendar API integration
- Google Meet link auto-generation
- MCP Server for Claude Desktop
- OAuth 2.0 authentication
- Recurring meeting support
- Natural language scheduling

**Phase 2: Auto Meeting Minutes** ✅
- Google Meet API transcript retrieval
- OpenAI GPT-4 summarization
- Template system (default, NPO, government)
- Notion API integration
- Slack webhook integration
- CLI processing tool

### Features

- 📅 **Calendar Management**
  - Create/update/delete events
  - Add participants automatically
  - Schedule recurring meetings

- 🤖 **AI Meeting Minutes**
  - Automatic transcript retrieval
  - Intelligent summarization
  - Action item extraction
  - Decision tracking

- 📝 **Distribution**
  - Automatic Notion page creation
  - Slack channel notifications
  - Structured data format

- 🏢 **Templates**
  - Default: General meetings
  - NPO: Non-profit organizations
  - Government: Administrative meetings

### Services

- `GoogleAuthService` - OAuth 2.0 authentication
- `CalendarService` - Calendar API wrapper
- `MeetService` - Meet API & transcripts
- `NotionService` - Notion integration
- `SlackService` - Slack notifications
- `MinutesGenerator` - AI summarization

### Documentation

- Getting Started Guide
- Google Cloud Setup Guide
- Phase 1 Quick Start
- Phase 2 Transcript Guide
- Architecture Documentation
