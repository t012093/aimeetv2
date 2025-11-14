/**
 * Recall.ai API Integration
 * Meeting bot that joins Google Meet calls to record and transcribe
 * https://docs.recall.ai/
 */

export interface RecallConfig {
  apiKey: string;
  region: 'us-west-2' | 'us-east-1' | 'eu-central-1' | 'ap-northeast-1';
  webhookUrl?: string;
}

export interface BotConfig {
  meetingUrl: string;
  botName?: string;
  transcriptionProvider?: 'meeting_captions' | 'recallai_streaming' | 'deepgram' | 'assembly_ai';
  transcriptionLanguage?: string; // e.g., 'ja' for Japanese, 'en' for English
  transcriptionMode?: 'prioritize_accuracy' | 'prioritize_low_latency'; // For recallai_streaming
  recordVideo?: boolean;
  recordAudio?: boolean;
  automaticLeave?: {
    waitingRoomTimeout?: number; // seconds
    nooneJoinedTimeout?: number; // seconds
    everyoneLeftTimeout?: number; // seconds
  };
  realtimeTranscription?: boolean;
  webhookEvents?: string[];
  metadata?: Record<string, any>; // Custom metadata for the bot
}

export interface Bot {
  id: string;
  meeting_url: any;
  bot_name: string;
  status_changes: StatusChange[];
  media_retention_end?: string;
  recordings?: any[];
  metadata?: Record<string, any>;
}

export interface StatusChange {
  code: string;
  message?: string;
  created_at: string;
  sub_code?: string;
}

export interface Transcript {
  transcript_id: string;
  bot_id: string;
  words: TranscriptWord[];
}

export interface TranscriptWord {
  text: string;
  start_time: number; // seconds
  end_time: number;
  speaker?: string;
}

export interface BotStatus {
  code:
    | 'ready'
    | 'joining'
    | 'in_waiting_room'
    | 'in_call_not_recording'
    | 'in_call_recording'
    | 'call_ended'
    | 'done'
    | 'fatal';
  message?: string;
  created_at: string;
}

/**
 * RecallService - Recall.ai API wrapper
 * Manages meeting bots that join and record Google Meet calls
 */
export class RecallService {
  private apiKey: string;
  private baseUrl: string;
  private webhookUrl?: string;

  constructor(config: RecallConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = `https://${config.region}.recall.ai/api/v1`;
    this.webhookUrl = config.webhookUrl;
  }

  /**
   * Create a bot and send it to a meeting
   */
  async createBot(config: BotConfig): Promise<Bot> {
    const requestBody: any = {
      meeting_url: config.meetingUrl,
      bot_name: config.botName || 'AIMeet Recorder',
      automatic_leave: config.automaticLeave || {
        waiting_room_timeout: 1200, // 20 minutes
        noone_joined_timeout: 1200,
        everyone_left_timeout: 30,
      },
    };

    // Recording configuration
    const recordingConfig: any = {};

    // Video recording
    if (config.recordVideo !== false) {
      recordingConfig.output_video_codec = 'av1';
    }

    // Audio recording
    if (config.recordAudio !== false) {
      recordingConfig.output_audio_codec = 'opus';
    }

    // Transcription
    const transcriptProvider = config.transcriptionProvider || 'recallai_streaming';
    const transcriptConfig: any = {};

    if (transcriptProvider === 'recallai_streaming') {
      transcriptConfig.mode = config.transcriptionMode || 'prioritize_accuracy';
      if (config.transcriptionLanguage) {
        transcriptConfig.language = config.transcriptionLanguage;
      }
    }

    recordingConfig.transcript = {
      provider: {
        [transcriptProvider]: transcriptConfig,
      },
    };

    // Real-time transcription
    if (config.realtimeTranscription && this.webhookUrl) {
      recordingConfig.realtime_transcription = {
        destination_url: this.webhookUrl,
      };
    }

    // Webhook events
    if (config.webhookEvents && config.webhookEvents.length > 0 && this.webhookUrl) {
      recordingConfig.realtime_endpoints = [
        {
          type: 'webhook',
          url: this.webhookUrl,
          events: config.webhookEvents,
        },
      ];
    }

    requestBody.recording_config = recordingConfig;

    // Add metadata if provided
    if (config.metadata) {
      requestBody.metadata = config.metadata;
    }

    console.log(`🤖 Creating Recall.ai bot for: ${config.meetingUrl}`);

    const response = await fetch(`${this.baseUrl}/bot/`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to create bot: ${response.status} - ${error}`);
    }

    const bot: Bot = await response.json();
    console.log(`✅ Bot created: ${bot.id}`);
    // Get latest status (last item in array)
    const latestStatus = bot.status_changes[bot.status_changes.length - 1];
    console.log(`   Status: ${latestStatus?.code || 'unknown'}`);

    return bot;
  }

  /**
   * Get bot status and details
   */
  async getBot(botId: string): Promise<Bot> {
    const response = await fetch(`${this.baseUrl}/bot/${botId}/`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get bot: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Wait for bot to finish recording
   * Polls the API until the bot status is 'done' or 'fatal'
   */
  async waitForBotCompletion(
    botId: string,
    options: {
      pollInterval?: number; // milliseconds
      maxWaitTime?: number; // milliseconds
      onStatusChange?: (status: BotStatus) => void;
    } = {}
  ): Promise<Bot> {
    const pollInterval = options.pollInterval || 10000; // 10 seconds
    const maxWaitTime = options.maxWaitTime || 7200000; // 2 hours
    const startTime = Date.now();

    let lastStatus: string | undefined;

    while (true) {
      const bot = await this.getBot(botId);
      // Get the LATEST status (last item in array, not first!)
      const currentStatus = bot.status_changes[bot.status_changes.length - 1];

      // Status changed
      if (currentStatus?.code !== lastStatus) {
        lastStatus = currentStatus?.code;
        console.log(`🤖 Bot status: ${currentStatus?.code} ${currentStatus?.message || ''}`);

        if (options.onStatusChange) {
          options.onStatusChange(currentStatus as BotStatus);
        }
      }

      // Check if done
      if (currentStatus?.code === 'done') {
        console.log('✅ Bot finished recording');
        return bot;
      }

      // Check if failed
      if (currentStatus?.code === 'fatal') {
        throw new Error(`Bot failed: ${currentStatus?.message || 'Unknown error'}`);
      }

      // Check timeout
      if (Date.now() - startTime > maxWaitTime) {
        throw new Error('Bot wait timeout exceeded');
      }

      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }

  /**
   * Get transcript for a completed bot
   */
  async getTranscript(botId: string): Promise<Transcript> {
    // First, get bot to find transcript ID
    const bot = await this.getBot(botId);

    // Find transcript ID from recordings
    const transcript = bot.recordings?.[0]?.media_shortcuts?.transcript;
    if (!transcript || !transcript.id) {
      throw new Error('No transcript found for this bot');
    }

    const transcriptId = transcript.id;

    // Use new endpoint: /transcript/{id}
    const response = await fetch(`${this.baseUrl}/transcript/${transcriptId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get transcript: ${response.status} - ${error}`);
    }

    // Download transcript content from data.download_url
    const downloadUrl = transcript.data?.download_url;
    if (!downloadUrl) {
      throw new Error('No download URL found for transcript');
    }

    const contentResponse = await fetch(downloadUrl);
    if (!contentResponse.ok) {
      throw new Error(`Failed to download transcript content: ${contentResponse.status}`);
    }

    const content = await contentResponse.json();

    // Transform to our format
    // Content is an array of participants with their words
    const allWords: TranscriptWord[] = [];

    if (Array.isArray(content)) {
      for (const participantData of content) {
        const participantName = participantData.participant?.name || 'Unknown';
        const words = participantData.words || [];

        for (const word of words) {
          allWords.push({
            text: word.text,
            start_time: word.start_timestamp?.relative || 0,
            end_time: word.end_timestamp?.relative || 0,
            speaker: participantName,
          });
        }
      }
    }

    return {
      transcript_id: transcriptId,
      bot_id: botId,
      words: allWords,
    };
  }

  /**
   * Format transcript as plain text
   */
  formatTranscriptText(transcript: Transcript, includeTimestamps: boolean = false): string {
    const lines: string[] = [];

    for (const word of transcript.words) {
      const text = word.text;
      const speaker = word.speaker || 'Unknown';
      const time = Math.floor(word.start_time);
      const minutes = Math.floor(time / 60);
      const seconds = time % 60;
      const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;

      if (includeTimestamps) {
        lines.push(`${timestamp} ${speaker}: ${text}`);
      } else {
        lines.push(`${speaker}: ${text}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Get recording URLs (video/audio)
   */
  async getRecordingUrls(_botId: string): Promise<{ video_url?: string; audio_url?: string }> {
    // Note: Actual implementation would fetch bot and extract URLs
    // This is a placeholder for future implementation
    return {
      video_url: undefined, // Would be extracted from bot response
      audio_url: undefined, // Would be extracted from bot response
    };
  }

  /**
   * Delete a bot and its recordings
   */
  async deleteBot(botId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/bot/${botId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete bot: ${response.status}`);
    }

    console.log(`🗑️  Bot deleted: ${botId}`);
  }

  /**
   * List all bots
   */
  async listBots(limit: number = 10): Promise<Bot[]> {
    const response = await fetch(`${this.baseUrl}/bot/?limit=${limit}`, {
      method: 'GET',
      headers: {
        'Authorization': `Token ${this.apiKey}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to list bots: ${response.status}`);
    }

    const data = await response.json();
    return data.results || [];
  }
}

/**
 * Create RecallService from environment variables
 */
export function createRecallServiceFromEnv(): RecallService {
  const apiKey = process.env.RECALL_API_KEY;
  const region = (process.env.RECALL_REGION || 'us-west-2') as RecallConfig['region'];
  const webhookUrl = process.env.RECALL_WEBHOOK_URL;

  if (!apiKey) {
    throw new Error('RECALL_API_KEY environment variable is required');
  }

  return new RecallService({
    apiKey,
    region,
    webhookUrl,
  });
}

/**
 * Helper: Extract Meet URL from calendar event
 */
export function extractMeetUrl(htmlLink: string | undefined): string | null {
  if (!htmlLink) return null;
  const match = htmlLink.match(/https:\/\/meet\.google\.com\/[a-z\-]+/);
  return match ? match[0] : null;
}
