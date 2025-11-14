import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TOKEN_PATH = path.join(__dirname, '../../token.json');

// Required scopes for Calendar and Meet
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/meetings.space.readonly',
];

export interface GoogleAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor(config: GoogleAuthConfig) {
    this.oauth2Client = new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      config.redirectUri
    );
  }

  /**
   * Get authentication URL for initial OAuth flow
   */
  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent', // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokenFromCode(code: string): Promise<void> {
    const { tokens } = await this.oauth2Client.getToken(code);
    this.oauth2Client.setCredentials(tokens);
    await this.saveToken(tokens);
  }

  /**
   * Load existing token from file
   */
  async loadToken(): Promise<boolean> {
    try {
      const tokenData = await fs.readFile(TOKEN_PATH, 'utf-8');
      const tokens = JSON.parse(tokenData);
      this.oauth2Client.setCredentials(tokens);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Save token to file
   */
  private async saveToken(tokens: any): Promise<void> {
    await fs.writeFile(TOKEN_PATH, JSON.stringify(tokens, null, 2));
  }

  /**
   * Get authenticated OAuth2 client
   */
  getClient(): OAuth2Client {
    return this.oauth2Client;
  }

  /**
   * Check if we have valid credentials
   */
  async isAuthenticated(): Promise<boolean> {
    const hasToken = await this.loadToken();
    if (!hasToken) return false;

    try {
      // Try to refresh token if needed
      await this.oauth2Client.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Revoke current credentials
   */
  async revokeCredentials(): Promise<void> {
    await this.oauth2Client.revokeCredentials();
    try {
      await fs.unlink(TOKEN_PATH);
    } catch {
      // Ignore if file doesn't exist
    }
  }
}

/**
 * Create GoogleAuthService from environment variables
 */
export function createAuthServiceFromEnv(): GoogleAuthService {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/oauth2callback';

  if (!clientId || !clientSecret) {
    throw new Error(
      'Missing required environment variables: GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET'
    );
  }

  return new GoogleAuthService({
    clientId,
    clientSecret,
    redirectUri,
  });
}
