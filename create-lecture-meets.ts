/**
 * Script to create 7 Google Meet events for weekly lectures
 *
 * Schedule:
 * - Every Wednesday, 20:00-21:00
 * - 2025: Dec 10, 17, 24
 * - 2026: Jan 7, 14, 21, 28
 */

import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { OAuth2Client } from 'google-auth-library';
import { fileURLToPath } from 'url';

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const TOKEN_PATH = path.join(__dirname, 'token.json');
const CREDENTIALS = {
  client_id: process.env.GOOGLE_CLIENT_ID!,
  client_secret: process.env.GOOGLE_CLIENT_SECRET!,
  redirect_uris: [process.env.GOOGLE_REDIRECT_URI!],
};

// Lecture dates
const LECTURE_DATES = [
  { date: '2025-12-10', number: 1 },
  { date: '2025-12-17', number: 2 },
  { date: '2025-12-24', number: 3 },
  { date: '2026-01-07', number: 4 },
  { date: '2026-01-14', number: 5 },
  { date: '2026-01-21', number: 6 },
  { date: '2026-01-28', number: 7 },
];

async function authorize(): Promise<OAuth2Client> {
  const { client_id, client_secret, redirect_uris } = CREDENTIALS;
  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
  );

  // Check if we have previously stored a token
  if (fs.existsSync(TOKEN_PATH)) {
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
  }

  // Get new token
  return getNewToken(oAuth2Client);
}

function getNewToken(oAuth2Client: OAuth2Client): Promise<OAuth2Client> {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('Authorize this app by visiting this url:', authUrl);

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve, reject) => {
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err || !token) {
          return reject(err || new Error('No token received'));
        }
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
        console.log('Token stored to', TOKEN_PATH);
        resolve(oAuth2Client);
      });
    });
  });
}

async function createLectureEvent(
  auth: OAuth2Client,
  lectureNumber: number,
  date: string
): Promise<any> {
  const calendar = google.calendar({ version: 'v3', auth });

  const event = {
    summary: `WEB講義 第${lectureNumber}回`,
    description: `NPO支援センター主催 WEB講義\n第${lectureNumber}回目の講義です。`,
    start: {
      dateTime: `${date}T20:00:00+09:00`,
      timeZone: 'Asia/Tokyo',
    },
    end: {
      dateTime: `${date}T21:00:00+09:00`,
      timeZone: 'Asia/Tokyo',
    },
    conferenceData: {
      createRequest: {
        requestId: `lecture-${lectureNumber}-${Date.now()}`,
        conferenceSolutionKey: { type: 'hangoutsMeet' },
      },
    },
    reminders: {
      useDefault: false,
      overrides: [
        { method: 'email', minutes: 24 * 60 }, // 1 day before
        { method: 'popup', minutes: 30 },
      ],
    },
  };

  const response = await calendar.events.insert({
    calendarId: 'primary',
    conferenceDataVersion: 1,
    requestBody: event,
  });

  return response.data;
}

async function main() {
  console.log('🚀 Creating 7 Google Meet events for weekly lectures...\n');

  try {
    const auth = await authorize();
    const createdEvents: any[] = [];

    for (const lecture of LECTURE_DATES) {
      console.log(`Creating event for Lecture ${lecture.number} (${lecture.date})...`);
      const event = await createLectureEvent(auth, lecture.number, lecture.date);
      createdEvents.push({
        number: lecture.number,
        date: lecture.date,
        meetUrl: event.hangoutLink,
        calendarUrl: event.htmlLink,
        eventId: event.id,
      });
      console.log(`✅ Created! Meet URL: ${event.hangoutLink}\n`);
    }

    // Save results to file
    const resultsPath = path.join(__dirname, 'lecture-meets.json');
    fs.writeFileSync(resultsPath, JSON.stringify(createdEvents, null, 2));
    console.log(`\n📝 Results saved to: ${resultsPath}`);

    // Print summary
    console.log('\n📅 Summary of Created Events:\n');
    console.log('=' .repeat(80));
    createdEvents.forEach((event) => {
      console.log(`第${event.number}回 - ${event.date} (水) 20:00-21:00`);
      console.log(`  Google Meet: ${event.meetUrl}`);
      console.log(`  Calendar: ${event.calendarUrl}`);
      console.log('');
    });
    console.log('=' .repeat(80));

    console.log('\n✨ All events created successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Share the Google Meet URLs with participants');
    console.log('2. Send calendar invitations if needed');
    console.log('3. Check the lecture-meets.json file for all URLs');

  } catch (error) {
    console.error('❌ Error creating events:', error);
    process.exit(1);
  }
}

main();
