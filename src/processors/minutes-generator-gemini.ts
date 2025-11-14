import { GoogleGenerativeAI } from '@google/generative-ai';
import { MeetingMinutes, TEMPLATES } from './minutes-generator.js';

export class GeminiMinutesGenerator {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  /**
   * Generate meeting minutes from transcript using Gemini
   */
  async generate(
    transcript: string,
    templateName: keyof typeof TEMPLATES = 'default',
    context?: any,
    model: string = 'gemini-1.5-flash'
  ): Promise<MeetingMinutes> {
    const template = TEMPLATES[templateName];

    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    const geminiModel = this.genAI.getGenerativeModel({
      model,
      generationConfig: {
        temperature: 0.3,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `${template.systemPrompt}

${template.userPromptTemplate(transcript, context)}`;

    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    if (!text) {
      throw new Error('No content in Gemini response');
    }

    const parsed = JSON.parse(text);

    return {
      summary: parsed.summary || '',
      keyPoints: parsed.keyPoints || [],
      decisions: parsed.decisions || [],
      actionItems: parsed.actionItems || [],
      participants: parsed.participants || [],
      unresolvedIssues: parsed.unresolvedIssues || [],
      aiSuggestions: parsed.aiSuggestions || [],
      timeline: parsed.timeline || [],
      risks: parsed.risks || [],
      nextSteps: parsed.nextSteps || [],
      nextMeetingAgenda: parsed.nextMeetingAgenda,
      rawTranscript: transcript,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate summary only (faster, cheaper)
   */
  async generateSummary(transcript: string, model: string = 'gemini-2.0-flash-exp'): Promise<string> {
    const geminiModel = this.genAI.getGenerativeModel({ model });

    const prompt = `以下の会議の文字起こしから、2-3文で簡潔な概要を作成してください：

${transcript}`;

    const result = await geminiModel.generateContent(prompt);
    return result.response.text();
  }
}

export function createGeminiMinutesGeneratorFromEnv(): GeminiMinutesGenerator {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment');
  }

  return new GeminiMinutesGenerator(apiKey);
}
