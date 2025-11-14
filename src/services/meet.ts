import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const meet = google.meet('v2');

export interface TranscriptEntry {
  name: string; // Resource name
  participant: string; // Participant resource name
  text: string; // Transcript text
  languageCode: string;
  startTime: string; // ISO 8601
  endTime: string;
}

export interface Transcript {
  name: string; // Resource name (e.g., conferenceRecords/xxx/transcripts/yyy)
  state: string; // STARTED, ENDED, FILE_GENERATED
  startTime: string;
  endTime?: string;
}

export interface ConferenceRecord {
  name: string; // Resource name
  startTime: string;
  endTime?: string;
  space: string; // Meet space resource
}

export class MeetService {
  private authClient: OAuth2Client;

  constructor(authClient: OAuth2Client) {
    this.authClient = authClient;
  }

  /**
   * List conference records (past meetings)
   * Filter by time range or space
   */
  async listConferenceRecords(
    pageSize: number = 10,
    filter?: string
  ): Promise<ConferenceRecord[]> {
    const response = await meet.conferenceRecords.list({
      auth: this.authClient,
      pageSize,
      filter, // e.g., "space.name = 'spaces/xxx'" or "end_time > '2024-01-01T00:00:00Z'"
    });

    return (response.data.conferenceRecords || []).map(record => ({
      name: record.name!,
      startTime: record.startTime!,
      endTime: record.endTime || undefined,
      space: record.space!,
    }));
  }

  /**
   * Get a specific conference record by name
   */
  async getConferenceRecord(conferenceName: string): Promise<ConferenceRecord> {
    const response = await meet.conferenceRecords.get({
      auth: this.authClient,
      name: conferenceName,
    });

    return {
      name: response.data.name!,
      startTime: response.data.startTime!,
      endTime: response.data.endTime || undefined,
      space: response.data.space!,
    };
  }

  /**
   * List transcripts for a conference
   * Returns metadata about available transcripts
   */
  async listTranscripts(conferenceName: string): Promise<Transcript[]> {
    const response = await meet.conferenceRecords.transcripts.list({
      auth: this.authClient,
      parent: conferenceName,
    });

    return (response.data.transcripts || []).map(transcript => ({
      name: transcript.name!,
      state: transcript.state!,
      startTime: transcript.startTime!,
      endTime: transcript.endTime || undefined,
    }));
  }

  /**
   * Get full transcript entries (actual text lines)
   * This is the core function to retrieve meeting transcript
   */
  async getTranscriptEntries(transcriptName: string): Promise<TranscriptEntry[]> {
    const entries: TranscriptEntry[] = [];
    let pageToken: string | undefined;

    do {
      const response = await meet.conferenceRecords.transcripts.entries.list({
        auth: this.authClient,
        parent: transcriptName,
        pageSize: 100,
        pageToken,
      });

      const currentEntries = (response.data.transcriptEntries || []).map((entry: any) => ({
        name: entry.name!,
        participant: entry.participant!,
        text: entry.text!,
        languageCode: entry.languageCode!,
        startTime: entry.startTime!,
        endTime: entry.endTime!,
      }));

      entries.push(...currentEntries);
      pageToken = response.data.nextPageToken ?? undefined;
    } while (pageToken);

    return entries;
  }

  /**
   * Get participant information
   */
  async getParticipant(participantName: string): Promise<any> {
    const response = await meet.conferenceRecords.participants.get({
      auth: this.authClient,
      name: participantName,
    });

    return response.data;
  }

  /**
   * Convenience method: Get full meeting transcript with formatted text
   * Returns ready-to-use transcript text
   */
  async getFormattedTranscript(conferenceName: string): Promise<{
    conference: ConferenceRecord;
    transcript: Transcript;
    fullText: string;
    entries: TranscriptEntry[];
  }> {
    // Get conference info
    const conference = await this.getConferenceRecord(conferenceName);

    // Get transcripts list
    const transcripts = await this.listTranscripts(conferenceName);

    if (transcripts.length === 0) {
      throw new Error('No transcripts found for this conference');
    }

    // Use the first (or most recent) transcript
    const transcript = transcripts[0];

    // Get all entries
    const entries = await this.getTranscriptEntries(transcript.name);

    // Format as readable text
    const fullText = entries
      .map(entry => {
        const time = new Date(entry.startTime).toLocaleTimeString('ja-JP');
        return `[${time}] ${entry.text}`;
      })
      .join('\n');

    return {
      conference,
      transcript,
      fullText,
      entries,
    };
  }

  /**
   * Find conference record by Calendar event ID
   * Useful when triggered from calendar events
   */
  async findConferenceByEventId(_eventId: string): Promise<ConferenceRecord | null> {
    // Google Meet spaces are linked to Calendar events
    // The space name contains the event ID in some form
    // This is a best-effort search

    const records = await this.listConferenceRecords(50);

    // Filter by approximate time or other heuristics
    // Note: Direct eventId -> conference mapping requires Calendar API integration
    // For now, return the most recent one
    return records.length > 0 ? records[0] : null;
  }
}

/**
 * Helper: Parse conference record name to extract ID
 * conferenceRecords/abc-defg-hij -> abc-defg-hij
 */
export function parseConferenceId(conferenceName: string): string {
  return conferenceName.replace('conferenceRecords/', '');
}

/**
 * Helper: Parse transcript name to extract ID
 * conferenceRecords/xxx/transcripts/yyy -> yyy
 */
export function parseTranscriptId(transcriptName: string): string {
  const parts = transcriptName.split('/');
  return parts[parts.length - 1];
}
