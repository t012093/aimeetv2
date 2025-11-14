/**
 * AIMeet - AI-Powered Meeting Automation
 * Main entry point
 */

export { GoogleAuthService, createAuthServiceFromEnv } from './services/google-auth.js';
export { CalendarService } from './services/calendar.js';
export type { CreateEventParams, EventResult } from './services/calendar.js';
