#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { createAuthServiceFromEnv, GoogleAuthService } from '../services/google-auth.js';
import { CalendarService } from '../services/calendar.js';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Tool schemas
const CreateEventSchema = z.object({
  summary: z.string().describe('Event title/summary'),
  description: z.string().optional().describe('Event description'),
  startTime: z.string().describe('Start time in ISO 8601 format (e.g., 2024-11-20T15:00:00+09:00)'),
  endTime: z.string().describe('End time in ISO 8601 format'),
  timeZone: z.string().optional().default('Asia/Tokyo').describe('Time zone (default: Asia/Tokyo)'),
  attendees: z.array(z.string()).optional().describe('List of attendee email addresses'),
  addMeetLink: z.boolean().optional().default(true).describe('Add Google Meet link (default: true)'),
  location: z.string().optional().describe('Event location'),
  recurrence: z.array(z.string()).optional().describe('Recurrence rules in RRULE format'),
});

const GetUpcomingEventsSchema = z.object({
  maxResults: z.number().optional().default(10).describe('Maximum number of events to return'),
  timeMin: z.string().optional().describe('Lower bound (inclusive) for events (ISO 8601)'),
});

const GetEventSchema = z.object({
  eventId: z.string().describe('Calendar event ID'),
});

const UpdateEventSchema = z.object({
  eventId: z.string().describe('Calendar event ID to update'),
  summary: z.string().optional().describe('New event title'),
  description: z.string().optional().describe('New event description'),
  startTime: z.string().optional().describe('New start time (ISO 8601)'),
  endTime: z.string().optional().describe('New end time (ISO 8601)'),
  timeZone: z.string().optional().describe('Time zone'),
  attendees: z.array(z.string()).optional().describe('New attendee list'),
  location: z.string().optional().describe('New location'),
});

const DeleteEventSchema = z.object({
  eventId: z.string().describe('Calendar event ID to delete'),
  sendUpdates: z.boolean().optional().default(true).describe('Send cancellation emails to attendees'),
});

const SearchEventsSchema = z.object({
  query: z.string().describe('Search query'),
  maxResults: z.number().optional().default(10).describe('Maximum results'),
});

class CalendarMCPServer {
  private server: Server;
  private authService: GoogleAuthService;
  private calendarService?: CalendarService;

  constructor() {
    this.server = new Server(
      {
        name: 'google-calendar-meet',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.authService = createAuthServiceFromEnv();
    this.setupHandlers();
  }

  private async ensureAuthenticated(): Promise<void> {
    if (this.calendarService) return;

    const isAuth = await this.authService.isAuthenticated();
    if (!isAuth) {
      const authUrl = this.authService.getAuthUrl();
      throw new Error(
        `Not authenticated. Please visit this URL to authorize:\n${authUrl}\n\nAfter authorizing, run the auth script to save the token.`
      );
    }

    this.calendarService = new CalendarService(this.authService.getClient());
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools: Tool[] = [
        {
          name: 'create_event',
          description:
            'Create a new calendar event with optional Google Meet link. Supports one-time and recurring events.',
          inputSchema: {
            type: 'object',
            properties: {
              summary: { type: 'string', description: 'Event title' },
              description: { type: 'string', description: 'Event description' },
              startTime: {
                type: 'string',
                description: 'Start time (ISO 8601, e.g., 2024-11-20T15:00:00+09:00)',
              },
              endTime: {
                type: 'string',
                description: 'End time (ISO 8601)',
              },
              timeZone: {
                type: 'string',
                description: 'Time zone (default: Asia/Tokyo)',
              },
              attendees: {
                type: 'array',
                items: { type: 'string' },
                description: 'Attendee email addresses',
              },
              addMeetLink: {
                type: 'boolean',
                description: 'Add Google Meet link (default: true)',
              },
              location: { type: 'string', description: 'Event location' },
              recurrence: {
                type: 'array',
                items: { type: 'string' },
                description: 'RRULE for recurring events (e.g., ["RRULE:FREQ=WEEKLY;BYDAY=TU"])',
              },
            },
            required: ['summary', 'startTime', 'endTime'],
          },
        },
        {
          name: 'get_upcoming_events',
          description: 'Get upcoming calendar events',
          inputSchema: {
            type: 'object',
            properties: {
              maxResults: {
                type: 'number',
                description: 'Maximum number of events (default: 10)',
              },
              timeMin: {
                type: 'string',
                description: 'Start time filter (ISO 8601)',
              },
            },
          },
        },
        {
          name: 'get_event',
          description: 'Get details of a specific calendar event by ID',
          inputSchema: {
            type: 'object',
            properties: {
              eventId: { type: 'string', description: 'Calendar event ID' },
            },
            required: ['eventId'],
          },
        },
        {
          name: 'update_event',
          description: 'Update an existing calendar event',
          inputSchema: {
            type: 'object',
            properties: {
              eventId: { type: 'string', description: 'Event ID to update' },
              summary: { type: 'string', description: 'New title' },
              description: { type: 'string', description: 'New description' },
              startTime: { type: 'string', description: 'New start time (ISO 8601)' },
              endTime: { type: 'string', description: 'New end time (ISO 8601)' },
              timeZone: { type: 'string', description: 'Time zone' },
              attendees: {
                type: 'array',
                items: { type: 'string' },
                description: 'New attendees',
              },
              location: { type: 'string', description: 'New location' },
            },
            required: ['eventId'],
          },
        },
        {
          name: 'delete_event',
          description: 'Delete a calendar event',
          inputSchema: {
            type: 'object',
            properties: {
              eventId: { type: 'string', description: 'Event ID to delete' },
              sendUpdates: {
                type: 'boolean',
                description: 'Send cancellation emails (default: true)',
              },
            },
            required: ['eventId'],
          },
        },
        {
          name: 'search_events',
          description: 'Search calendar events by keyword',
          inputSchema: {
            type: 'object',
            properties: {
              query: { type: 'string', description: 'Search query' },
              maxResults: { type: 'number', description: 'Max results (default: 10)' },
            },
            required: ['query'],
          },
        },
      ];

      return { tools };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      await this.ensureAuthenticated();

      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'create_event': {
            const params = CreateEventSchema.parse(args);
            const result = await this.calendarService!.createEvent(params);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'get_upcoming_events': {
            const params = GetUpcomingEventsSchema.parse(args);
            const events = await this.calendarService!.getUpcomingEvents(
              params.maxResults,
              params.timeMin
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(events, null, 2),
                },
              ],
            };
          }

          case 'get_event': {
            const params = GetEventSchema.parse(args);
            const event = await this.calendarService!.getEvent(params.eventId);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(event, null, 2),
                },
              ],
            };
          }

          case 'update_event': {
            const params = UpdateEventSchema.parse(args);
            const { eventId, ...updates } = params;
            const result = await this.calendarService!.updateEvent(eventId, updates);
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(result, null, 2),
                },
              ],
            };
          }

          case 'delete_event': {
            const params = DeleteEventSchema.parse(args);
            await this.calendarService!.deleteEvent(params.eventId, params.sendUpdates);
            return {
              content: [
                {
                  type: 'text',
                  text: `Event ${params.eventId} deleted successfully`,
                },
              ],
            };
          }

          case 'search_events': {
            const params = SearchEventsSchema.parse(args);
            const events = await this.calendarService!.searchEvents(
              params.query,
              params.maxResults
            );
            return {
              content: [
                {
                  type: 'text',
                  text: JSON.stringify(events, null, 2),
                },
              ],
            };
          }

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${errorMessage}`,
            },
          ],
          isError: true,
        };
      }
    });
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Google Calendar & Meet MCP Server running on stdio');
  }
}

// Start server
const server = new CalendarMCPServer();
server.run().catch(console.error);
