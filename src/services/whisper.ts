import OpenAI from 'openai';
import * as fs from 'fs';
import * as path from 'path';

export interface WhisperTranscriptEntry {
  text: string;
  timestamp: number; // seconds from start
  speaker?: string;
}

export interface WhisperTranscript {
  fullText: string;
  entries: WhisperTranscriptEntry[];
  language: string;
  duration: number; // seconds
}

export interface TranscriptionOptions {
  language?: string; // 'ja' for Japanese, 'en' for English, etc.
  prompt?: string; // Optional context to improve accuracy
  temperature?: number; // 0-1, lower is more deterministic
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

/**
 * WhisperService - OpenAI Whisper API integration for audio transcription
 * Supports audio files from Google Meet recordings or local files
 */
export class WhisperService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Transcribe audio file to text using Whisper API
   * Supports: mp3, mp4, mpeg, mpga, m4a, wav, webm (max 25MB)
   */
  async transcribeAudioFile(
    filePath: string,
    options: TranscriptionOptions = {}
  ): Promise<WhisperTranscript> {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`Audio file not found: ${filePath}`);
    }

    // Check file size (Whisper API limit: 25MB)
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    if (fileSizeInMB > 25) {
      throw new Error(
        `File size (${fileSizeInMB.toFixed(2)}MB) exceeds Whisper API limit of 25MB. ` +
        `Consider splitting the file or using a different method.`
      );
    }

    console.log(`📝 Transcribing audio file: ${path.basename(filePath)}`);
    console.log(`   Size: ${fileSizeInMB.toFixed(2)}MB`);

    const fileStream = fs.createReadStream(filePath);

    try {
      // Use verbose_json to get timestamps
      const response = await this.openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        language: options.language,
        prompt: options.prompt,
        temperature: options.temperature ?? 0,
        response_format: 'verbose_json',
      });

      const verboseResponse = response as any;

      // Parse segments into entries
      const entries: WhisperTranscriptEntry[] = [];
      if (verboseResponse.segments) {
        for (const segment of verboseResponse.segments) {
          entries.push({
            text: segment.text.trim(),
            timestamp: segment.start,
            speaker: undefined, // Whisper doesn't provide speaker diarization
          });
        }
      }

      const transcript: WhisperTranscript = {
        fullText: verboseResponse.text || '',
        entries,
        language: verboseResponse.language || options.language || 'unknown',
        duration: verboseResponse.duration || 0,
      };

      console.log(`✅ Transcription complete`);
      console.log(`   Language: ${transcript.language}`);
      console.log(`   Duration: ${Math.floor(transcript.duration / 60)}m ${Math.floor(transcript.duration % 60)}s`);
      console.log(`   Segments: ${entries.length}`);
      console.log(`   Text length: ${transcript.fullText.length} chars`);

      return transcript;
    } catch (error: any) {
      throw new Error(`Whisper transcription failed: ${error.message}`);
    }
  }

  /**
   * Transcribe multiple audio files and combine them
   * Useful for long meetings split into multiple files
   */
  async transcribeMultipleFiles(
    filePaths: string[],
    options: TranscriptionOptions = {}
  ): Promise<WhisperTranscript> {
    console.log(`📝 Transcribing ${filePaths.length} audio files...`);

    const transcripts: WhisperTranscript[] = [];
    let totalDuration = 0;

    for (let i = 0; i < filePaths.length; i++) {
      console.log(`\n[${i + 1}/${filePaths.length}] Processing: ${path.basename(filePaths[i])}`);
      const transcript = await this.transcribeAudioFile(filePaths[i], options);
      transcripts.push(transcript);
      totalDuration += transcript.duration;
    }

    // Combine all transcripts
    const combinedEntries: WhisperTranscriptEntry[] = [];
    let cumulativeDuration = 0;

    for (const transcript of transcripts) {
      for (const entry of transcript.entries) {
        combinedEntries.push({
          ...entry,
          timestamp: entry.timestamp + cumulativeDuration,
        });
      }
      cumulativeDuration += transcript.duration;
    }

    const combined: WhisperTranscript = {
      fullText: transcripts.map(t => t.fullText).join('\n\n'),
      entries: combinedEntries,
      language: transcripts[0]?.language || 'unknown',
      duration: totalDuration,
    };

    console.log(`\n✅ Combined transcription complete`);
    console.log(`   Total duration: ${Math.floor(totalDuration / 60)}m ${Math.floor(totalDuration % 60)}s`);
    console.log(`   Total segments: ${combinedEntries.length}`);

    return combined;
  }

  /**
   * Format transcript for display or further processing
   */
  formatTranscript(transcript: WhisperTranscript, includeTimestamps: boolean = true): string {
    if (!includeTimestamps) {
      return transcript.fullText;
    }

    const lines: string[] = [];
    for (const entry of transcript.entries) {
      const minutes = Math.floor(entry.timestamp / 60);
      const seconds = Math.floor(entry.timestamp % 60);
      const timestamp = `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}]`;
      lines.push(`${timestamp} ${entry.text}`);
    }
    return lines.join('\n');
  }

  /**
   * Estimate transcription cost
   * Whisper API pricing: $0.006 per minute
   */
  estimateCost(durationInSeconds: number): number {
    const minutes = durationInSeconds / 60;
    return minutes * 0.006; // $0.006 per minute
  }

  /**
   * Get audio file duration without transcribing
   * Note: This is a simple estimate based on file size
   */
  estimateDuration(filePath: string): number {
    const stats = fs.statSync(filePath);
    const fileSizeInMB = stats.size / (1024 * 1024);
    // Rough estimate: 1MB ≈ 1 minute for compressed audio
    // This is just an approximation
    return fileSizeInMB * 60;
  }
}

/**
 * Create WhisperService from environment variables
 */
export function createWhisperServiceFromEnv(): WhisperService {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required for Whisper service');
  }

  return new WhisperService(apiKey);
}

/**
 * Helper: Check if file is a supported audio format
 */
export function isSupportedAudioFormat(filePath: string): boolean {
  const supportedExtensions = ['.mp3', '.mp4', '.mpeg', '.mpga', '.m4a', '.wav', '.webm'];
  const ext = path.extname(filePath).toLowerCase();
  return supportedExtensions.includes(ext);
}

/**
 * Helper: Format duration in human-readable format
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
}
