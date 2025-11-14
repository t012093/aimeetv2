/**
 * Meeting Orchestrator
 * Coordinates the entire flow from transcript retrieval to distribution
 */

import { GoogleAuthService } from '../services/google-auth.js';
import { CalendarService } from '../services/calendar.js';
import { MeetService } from '../services/meet.js';
import { MinutesGenerator, MeetingMinutes } from './minutes-generator.js';
import { GeminiMinutesGenerator } from './minutes-generator-gemini.js';
import { ClaudeMinutesGenerator } from './minutes-generator-claude.js';
import { NotionService } from '../services/notion.js';
import { SlackService } from '../services/slack.js';
import { WhisperService } from '../services/whisper.js';
import { RecallService, Bot } from '../services/recall.js';

export type TranscriptionMethod = 'google_meet_api' | 'whisper' | 'recall_bot';

export interface ProcessMeetingParams {
  // Google Meet API method
  conferenceRecordName?: string; // e.g., "conferenceRecords/abc-defg"

  // Whisper method
  audioFilePath?: string; // Path to audio file
  audioFilePaths?: string[]; // Multiple audio files

  // Recall.ai bot method
  meetingUrl?: string; // Google Meet URL (https://meet.google.com/xxx-xxxx-xxx)
  botId?: string; // Existing bot ID to fetch transcript
  waitForCompletion?: boolean; // Wait for bot to finish (default: true)

  // Common
  calendarEventId?: string;
  templateName?: 'default' | 'npo' | 'government' | 'interview';
  projectType?: 'international' | 'programming' | 'art' | 'interview' | 'default';
  context?: any; // Additional context for template
  method?: TranscriptionMethod; // Explicit method selection
}

export interface ProcessMeetingResult {
  minutes: MeetingMinutes;
  notionUrl?: string;
  slackPosted: boolean;
  errors: string[];
  botId?: string; // Recall.ai Bot ID (if used)
}

export class MeetingOrchestrator {
  private calendarService?: CalendarService;
  private meetService?: MeetService;
  private minutesGenerator: MinutesGenerator | GeminiMinutesGenerator | ClaudeMinutesGenerator;
  private notionService?: NotionService;
  private slackService?: SlackService;
  private whisperService?: WhisperService;
  private recallService?: RecallService;

  constructor(
    authService: GoogleAuthService | null,
    minutesGenerator: MinutesGenerator | GeminiMinutesGenerator | ClaudeMinutesGenerator,
    notionService?: NotionService,
    slackService?: SlackService,
    whisperService?: WhisperService,
    recallService?: RecallService
  ) {
    if (authService) {
      const authClient = authService.getClient();
      this.calendarService = new CalendarService(authClient);
      this.meetService = new MeetService(authClient);
    }
    this.minutesGenerator = minutesGenerator;
    this.notionService = notionService;
    this.slackService = slackService;
    this.whisperService = whisperService;
    this.recallService = recallService;
  }

  /**
   * Process a completed meeting end-to-end
   */
  async processMeeting(params: ProcessMeetingParams): Promise<ProcessMeetingResult> {
    const errors: string[] = [];

    let transcriptText: string;
    let eventTitle = 'Untitled Meeting';
    let projectType = params.projectType || 'default';
    let botId: string | undefined;

    // 1. Get transcript (from Google Meet API, Whisper, or Recall.ai bot)
    if (params.meetingUrl || params.botId) {
      // Use Recall.ai bot for live recording and transcription
      if (!this.recallService) {
        throw new Error('RecallService not configured. Please provide RECALL_API_KEY.');
      }

      let bot: Bot;

      if (params.botId) {
        // Use existing bot
        console.log(`🤖 Fetching bot: ${params.botId}`);
        bot = await this.recallService.getBot(params.botId);

        // Try to get projectType from bot metadata if not explicitly provided
        if (!params.projectType && bot.metadata?.projectType) {
          projectType = bot.metadata.projectType;
          console.log(`📁 Project type from bot metadata: ${projectType}`);
        }
      } else if (params.meetingUrl) {
        // Create new bot and send to meeting
        console.log(`🤖 Creating bot for meeting: ${params.meetingUrl}`);

        // Include projectType in bot metadata
        const metadata: Record<string, any> = {};
        if (projectType && projectType !== 'default') {
          metadata.projectType = projectType;
          console.log(`📁 Project type: ${projectType}`);
        }

        bot = await this.recallService.createBot({
          meetingUrl: params.meetingUrl,
          botName: 'AIMeet Recorder',
          transcriptionProvider: 'recallai_streaming',
          transcriptionLanguage: 'ja', // Japanese
          transcriptionMode: 'prioritize_accuracy',
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        });

        // Wait for bot to finish if requested
        if (params.waitForCompletion !== false) {
          console.log('⏳ Waiting for meeting to complete...');
          bot = await this.recallService.waitForBotCompletion(bot.id);
        }
      } else {
        throw new Error('Either meetingUrl or botId must be provided for Recall.ai bot');
      }

      // Save bot ID for later use
      botId = bot.id;

      // Only fetch transcript if waiting for completion
      if (params.waitForCompletion !== false) {
        // Get transcript
        console.log('📝 Fetching transcript from Recall.ai...');
        const transcript = await this.recallService.getTranscript(bot.id);
        transcriptText = this.recallService.formatTranscriptText(transcript);
        console.log(`✅ Transcript retrieved (${transcript.words.length} words)`);

        eventTitle = 'Recall.ai Recorded Meeting';
      } else {
        // Bot started but not waiting for completion
        console.log(`✅ Bot started: ${bot.id}`);
        console.log('⏸️  Not waiting for completion. Use --bot ${bot.id} to process later.');

        // Return early without generating minutes
        return {
          minutes: {
            summary: '',
            keyPoints: [],
            decisions: [],
            actionItems: [],
            participants: [],
            rawTranscript: '',
            generatedAt: new Date().toISOString(),
          },
          slackPosted: false,
          errors: [],
          botId: bot.id,
        };
      }
    } else if (params.audioFilePath || params.audioFilePaths) {
      // Use Whisper for audio file transcription
      if (!this.whisperService) {
        throw new Error('WhisperService not configured. Please provide OPENAI_API_KEY.');
      }

      console.log('📊 Processing meeting from audio file(s)');
      console.log('📝 Transcribing with Whisper API...');

      const transcript = params.audioFilePaths
        ? await this.whisperService.transcribeMultipleFiles(params.audioFilePaths)
        : await this.whisperService.transcribeAudioFile(params.audioFilePath!);

      transcriptText = transcript.fullText;
      console.log(`✅ Transcript retrieved (${transcript.entries.length} segments)`);

      // Extract title from filename if not provided
      if (params.audioFilePath) {
        const path = await import('path');
        eventTitle = path.basename(params.audioFilePath, path.extname(params.audioFilePath));
      }
    } else if (params.conferenceRecordName) {
      // Use Google Meet API for transcript
      if (!this.meetService) {
        throw new Error('MeetService not configured. Please authenticate with Google.');
      }

      console.log(`📊 Processing meeting: ${params.conferenceRecordName}`);
      console.log('📝 Fetching transcript from Google Meet API...');

      const transcriptData = await this.meetService.getFormattedTranscript(
        params.conferenceRecordName
      );

      transcriptText = transcriptData.fullText;
      console.log(`✅ Transcript retrieved (${transcriptData.entries.length} entries)`);
    } else {
      throw new Error('Either conferenceRecordName, audioFilePath, meetingUrl, or botId must be provided');
    }

    // 2. Get calendar event details (if available)
    let meetLink: string | undefined;

    if (params.calendarEventId && this.calendarService) {
      try {
        const event = await this.calendarService.getEvent(params.calendarEventId);
        eventTitle = event.summary;
        meetLink = event.meetLink;
        console.log(`📅 Calendar event: ${eventTitle}`);
      } catch (error) {
        errors.push(`Failed to fetch calendar event: ${error}`);
      }
    }

    // 3. Generate meeting minutes
    console.log('🤖 Generating meeting minutes with AI...');

    // Auto-select template based on project type if not explicitly provided
    let templateName = params.templateName;
    if (!templateName) {
      // Map project types to templates
      const templateMap: Record<string, 'default' | 'npo' | 'government' | 'interview'> = {
        interview: 'interview',
        international: 'npo',
        programming: 'npo',
        art: 'npo',
        default: 'default',
      };
      templateName = templateMap[projectType] || 'default';
      console.log(`📋 Using template: ${templateName} (auto-selected from project type: ${projectType})`);
    }

    const minutes = await this.minutesGenerator.generate(
      transcriptText,
      templateName,
      params.context
    );

    console.log('✅ Minutes generated');

    // 4. Post to Notion
    let notionUrl: string | undefined;
    if (this.notionService) {
      try {
        console.log('📝 Creating Notion page...');
        const notionPage = await this.notionService.createMeetingPage(
          eventTitle,
          minutes,
          meetLink,
          params.calendarEventId
        );
        notionUrl = notionPage.url;
        console.log(`✅ Notion page created: ${notionUrl}`);
      } catch (error) {
        errors.push(`Failed to create Notion page: ${error}`);
        console.error('❌ Notion error:', error);
      }
    }

    // 5. Post to Slack
    let slackPosted = false;
    if (this.slackService) {
      try {
        console.log('📢 Posting to Slack...');
        await this.slackService.postMeetingMinutes(eventTitle, minutes, notionUrl, meetLink, projectType as any);
        slackPosted = true;
        const channel = this.slackService.getChannelForProject(projectType as any);
        console.log(`✅ Posted to Slack (#${channel})`);
      } catch (error) {
        errors.push(`Failed to post to Slack: ${error}`);
        console.error('❌ Slack error:', error);
      }
    }

    console.log(`🎉 Meeting processing complete (${errors.length} errors)`);

    return {
      minutes,
      notionUrl,
      slackPosted,
      errors,
      botId,
    };
  }

  /**
   * Process the most recent meeting for a calendar event
   */
  async processMostRecentMeeting(
    calendarEventId: string,
    templateName?: 'default' | 'npo' | 'government' | 'interview'
  ): Promise<ProcessMeetingResult> {
    console.log(`🔍 Finding conference record for event: ${calendarEventId}`);

    // Get calendar event
    const event = await this.calendarService!.getEvent(calendarEventId);

    if (!event.meetLink) {
      throw new Error('Calendar event does not have a Meet link');
    }

    // Find conference record
    // Note: This is a simplified approach - in production you'd want
    // more robust matching logic
    if (!this.meetService) {
      throw new Error('MeetService not configured');
    }
    const conferences = await this.meetService.listConferenceRecords(10);

    if (conferences.length === 0) {
      throw new Error('No conference records found');
    }

    // Use the most recent one (simplified)
    const conference = conferences[0];

    return this.processMeeting({
      conferenceRecordName: conference.name,
      calendarEventId,
      templateName,
    });
  }

  /**
   * Batch process multiple meetings
   */
  async processBatch(
    conferenceRecordNames: string[],
    templateName?: 'default' | 'npo' | 'government' | 'interview'
  ): Promise<ProcessMeetingResult[]> {
    const results: ProcessMeetingResult[] = [];

    for (const name of conferenceRecordNames) {
      try {
        const result = await this.processMeeting({
          conferenceRecordName: name,
          templateName,
        });
        results.push(result);
      } catch (error) {
        console.error(`Failed to process ${name}:`, error);
        results.push({
          minutes: {
            summary: 'Processing failed',
            keyPoints: [],
            decisions: [],
            actionItems: [],
            participants: [],
            rawTranscript: '',
            generatedAt: new Date().toISOString(),
          },
          slackPosted: false,
          errors: [String(error)],
        });
      }
    }

    return results;
  }
}

/**
 * Factory function to create orchestrator from environment
 */
export async function createOrchestratorFromEnv(
  authService: GoogleAuthService | null,
  minutesGenerator: MinutesGenerator | GeminiMinutesGenerator | ClaudeMinutesGenerator,
  projectType?: string
): Promise<MeetingOrchestrator> {
  let notionService: NotionService | undefined;
  let slackService: SlackService | undefined;
  let whisperService: WhisperService | undefined;

  // Notion is optional
  if (process.env.NOTION_API_KEY) {
    try {
      const { createNotionServiceFromEnv } = await import('../services/notion.js');
      type ProjectType = 'international' | 'programming' | 'art' | 'interview' | 'default';
      const validProjectType = (projectType as ProjectType) || 'default';
      notionService = createNotionServiceFromEnv(validProjectType);
    } catch (error) {
      console.warn('Notion service not configured:', error);
    }
  }

  // Slack is optional
  if (process.env.SLACK_WEBHOOK_URL) {
    try {
      const { createSlackServiceFromEnv } = await import('../services/slack.js');
      slackService = createSlackServiceFromEnv();
    } catch (error) {
      console.warn('Slack service not configured:', error);
    }
  }

  // Whisper is optional (requires OPENAI_API_KEY)
  if (process.env.OPENAI_API_KEY) {
    try {
      const { createWhisperServiceFromEnv } = await import('../services/whisper.js');
      whisperService = createWhisperServiceFromEnv();
    } catch (error) {
      console.warn('Whisper service not configured:', error);
    }
  }

  // Recall.ai is optional (requires RECALL_API_KEY)
  let recallService: RecallService | undefined;
  if (process.env.RECALL_API_KEY) {
    try {
      const { createRecallServiceFromEnv } = await import('../services/recall.js');
      recallService = createRecallServiceFromEnv();
    } catch (error) {
      console.warn('Recall.ai service not configured:', error);
    }
  }

  return new MeetingOrchestrator(authService, minutesGenerator, notionService, slackService, whisperService, recallService);
}
