#!/usr/bin/env node
/**
 * Initial authentication script for Google OAuth
 * Run this once to generate token.json
 */

import { createAuthServiceFromEnv } from '../services/google-auth.js';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(query, resolve);
  });
}

async function main() {
  console.log('🔐 Google OAuth Authentication for AIMeet\n');

  try {
    const authService = createAuthServiceFromEnv();

    // Check if already authenticated
    const isAuthenticated = await authService.isAuthenticated();
    if (isAuthenticated) {
      console.log('✅ Already authenticated! Token found and valid.');
      const reauth = await question('\nDo you want to re-authenticate? (y/N): ');
      if (reauth.toLowerCase() !== 'y') {
        console.log('Authentication cancelled.');
        rl.close();
        return;
      }
      await authService.revokeCredentials();
    }

    // Generate authorization URL
    const authUrl = authService.getAuthUrl();

    console.log('\n📋 Please follow these steps:\n');
    console.log('1. Open this URL in your browser:');
    console.log(`\n${authUrl}\n`);
    console.log('2. Sign in with your Google account');
    console.log('3. Grant the requested permissions');
    console.log('4. Copy the authorization code from the redirect URL\n');

    const code = await question('Enter the authorization code: ');

    if (!code.trim()) {
      console.error('❌ No code provided. Authentication cancelled.');
      rl.close();
      return;
    }

    console.log('\n⏳ Exchanging code for tokens...');
    await authService.getTokenFromCode(code.trim());

    console.log('✅ Authentication successful!');
    console.log('🎉 Token saved to token.json');
    console.log('\nYou can now use the MCP server:');
    console.log('  npm run mcp:calendar');

  } catch (error) {
    console.error('\n❌ Authentication failed:', error);
    if (error instanceof Error) {
      console.error(error.message);
    }
  } finally {
    rl.close();
  }
}

main();
