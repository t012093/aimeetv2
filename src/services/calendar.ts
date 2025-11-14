import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export interface CreateEventParams {
  summary: string;
  description?: string;
  startTime: string; // ISO 8601 format
  endTime: string;
  timeZone?: string;
  attendees?: string[]; // Email addresses
  addMeetLink?: boolean;
  location?: string;
  recurrence?: string[]; // RRULE format
}

export interface EventResult {
  id: string;
  htmlLink: string;
  meetLink?: string;
  summary: string;
  start: string;
  end: string;
}

export class CalendarService {
  private calendar: calendar_v3.Calendar;

  constructor(authClient: OAuth2Client) {
    this.calendar = google.calendar({ version: 'v3', auth: authClient });
  }

  /**
   * Create a calendar event with optional Google Meet link
   */
  async createEvent(params: CreateEventParams): Promise<EventResult> {
    const event: calendar_v3.Schema$Event = {
      summary: params.summary,
      description: params.description,
      location: params.location,
      start: {
        dateTime: params.startTime,
        timeZone: params.timeZone || 'Asia/Tokyo',
      },
      end: {
        dateTime: params.endTime,
        timeZone: params.timeZone || 'Asia/Tokyo',
      },
      attendees: params.attendees?.map(email => ({ email })),
      recurrence: params.recurrence,
      // Request Google Meet conference creation
      conferenceData: params.addMeetLink
        ? {
            createRequest: {
              requestId: `aimeet-${Date.now()}`,
              conferenceSolutionKey: { type: 'hangoutsMeet' },
            },
          }
        : undefined,
    };

    const response = await this.calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
      conferenceDataVersion: params.addMeetLink ? 1 : undefined,
      sendUpdates: params.attendees ? 'all' : 'none',
    });

    return this.formatEventResult(response.data);
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(
    maxResults: number = 10,
    timeMin?: string
  ): Promise<EventResult[]> {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []).map(event => this.formatEventResult(event));
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<EventResult> {
    const response = await this.calendar.events.get({
      calendarId: 'primary',
      eventId,
    });

    return this.formatEventResult(response.data);
  }

  /**
   * Update an existing event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<CreateEventParams>
  ): Promise<EventResult> {
    const event: calendar_v3.Schema$Event = {};

    if (updates.summary) event.summary = updates.summary;
    if (updates.description) event.description = updates.description;
    if (updates.location) event.location = updates.location;
    if (updates.startTime) {
      event.start = {
        dateTime: updates.startTime,
        timeZone: updates.timeZone || 'Asia/Tokyo',
      };
    }
    if (updates.endTime) {
      event.end = {
        dateTime: updates.endTime,
        timeZone: updates.timeZone || 'Asia/Tokyo',
      };
    }
    if (updates.attendees) {
      event.attendees = updates.attendees.map(email => ({ email }));
    }

    const response = await this.calendar.events.patch({
      calendarId: 'primary',
      eventId,
      requestBody: event,
      sendUpdates: updates.attendees ? 'all' : 'none',
    });

    return this.formatEventResult(response.data);
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId: string, sendUpdates: boolean = true): Promise<void> {
    await this.calendar.events.delete({
      calendarId: 'primary',
      eventId,
      sendUpdates: sendUpdates ? 'all' : 'none',
    });
  }

  /**
   * Search events by query
   */
  async searchEvents(query: string, maxResults: number = 10): Promise<EventResult[]> {
    const response = await this.calendar.events.list({
      calendarId: 'primary',
      q: query,
      maxResults,
      singleEvents: true,
      orderBy: 'startTime',
    });

    return (response.data.items || []).map(event => this.formatEventResult(event));
  }

  /**
   * Format event data into standardized result
   */
  private formatEventResult(event: calendar_v3.Schema$Event): EventResult {
    return {
      id: event.id!,
      htmlLink: event.htmlLink!,
      meetLink: event.conferenceData?.entryPoints?.find(
        ep => ep.entryPointType === 'video'
      )?.uri || undefined,
      summary: event.summary || 'No title',
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
    };
  }
}
