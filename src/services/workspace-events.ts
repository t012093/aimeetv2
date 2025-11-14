import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const workspaceEvents = google.workspaceevents('v1');

export interface Subscription {
  name: string;
  uid: string;
  targetResource: string;
  eventTypes: string[];
  notificationEndpoint: {
    pubsubTopic?: string;
  };
  state: string; // ACTIVE, SUSPENDED, DELETED
  createTime: string;
  updateTime: string;
}

export class WorkspaceEventsService {
  private authClient: OAuth2Client;

  constructor(authClient: OAuth2Client) {
    this.authClient = authClient;
  }

  /**
   * Create a subscription to Google Meet events
   * Requires a Cloud Pub/Sub topic for notifications
   *
   * Event types:
   * - google.workspace.meet.conference.v2.started
   * - google.workspace.meet.conference.v2.ended
   * - google.workspace.meet.recording.v2.fileGenerated
   * - google.workspace.meet.transcript.v2.fileGenerated
   */
  async createSubscription(
    targetResource: string, // e.g., "//meet.googleapis.com/spaces/*" for all spaces
    eventTypes: string[],
    pubsubTopic: string // e.g., "projects/my-project/topics/meet-events"
  ): Promise<Subscription> {
    const response = await workspaceEvents.subscriptions.create({
      auth: this.authClient,
      requestBody: {
        targetResource,
        eventTypes,
        notificationEndpoint: {
          pubsubTopic,
        },
      },
    });

    return this.formatSubscription(response.data);
  }

  /**
   * List existing subscriptions
   */
  async listSubscriptions(filter?: string): Promise<Subscription[]> {
    const response = await workspaceEvents.subscriptions.list({
      auth: this.authClient,
      filter, // e.g., "state = 'ACTIVE'"
    });

    return (response.data.subscriptions || []).map(sub => this.formatSubscription(sub));
  }

  /**
   * Get a specific subscription
   */
  async getSubscription(subscriptionName: string): Promise<Subscription> {
    const response = await workspaceEvents.subscriptions.get({
      auth: this.authClient,
      name: subscriptionName,
    });

    return this.formatSubscription(response.data);
  }

  /**
   * Update subscription (e.g., change event types)
   */
  async updateSubscription(
    subscriptionName: string,
    updates: {
      eventTypes?: string[];
      notificationEndpoint?: { pubsubTopic: string };
    }
  ): Promise<Subscription> {
    const response = await workspaceEvents.subscriptions.patch({
      auth: this.authClient,
      name: subscriptionName,
      requestBody: updates,
    });

    return this.formatSubscription(response.data);
  }

  /**
   * Delete a subscription
   */
  async deleteSubscription(subscriptionName: string): Promise<void> {
    await workspaceEvents.subscriptions.delete({
      auth: this.authClient,
      name: subscriptionName,
    });
  }

  /**
   * Reactivate a suspended subscription
   */
  async reactivateSubscription(subscriptionName: string): Promise<Subscription> {
    const response = await workspaceEvents.subscriptions.reactivate({
      auth: this.authClient,
      name: subscriptionName,
    });

    return this.formatSubscription(response.data);
  }

  private formatSubscription(data: any): Subscription {
    return {
      name: data.name,
      uid: data.uid,
      targetResource: data.targetResource,
      eventTypes: data.eventTypes || [],
      notificationEndpoint: data.notificationEndpoint || {},
      state: data.state,
      createTime: data.createTime,
      updateTime: data.updateTime,
    };
  }
}

/**
 * Pub/Sub message handler for Meet events
 * Parse incoming notifications from Workspace Events
 */
export interface MeetEventPayload {
  eventType: string;
  conferenceRecord?: string; // Resource name
  transcript?: string; // Resource name
  timestamp: string;
}

export function parsePubSubMessage(message: any): MeetEventPayload | null {
  try {
    const data = Buffer.from(message.data, 'base64').toString();
    const event = JSON.parse(data);

    return {
      eventType: event.eventType,
      conferenceRecord: event.conferenceRecord?.name,
      transcript: event.transcript?.name,
      timestamp: event.eventTimestamp || new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to parse Pub/Sub message:', error);
    return null;
  }
}

/**
 * Event types constants
 */
export const MEET_EVENT_TYPES = {
  CONFERENCE_STARTED: 'google.workspace.meet.conference.v2.started',
  CONFERENCE_ENDED: 'google.workspace.meet.conference.v2.ended',
  RECORDING_GENERATED: 'google.workspace.meet.recording.v2.fileGenerated',
  TRANSCRIPT_GENERATED: 'google.workspace.meet.transcript.v2.fileGenerated',
} as const;
