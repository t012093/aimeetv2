import Anthropic from '@anthropic-ai/sdk';
import { MeetingMinutes, TEMPLATES } from './minutes-generator.js';

export class ClaudeMinutesGenerator {
  private anthropic: Anthropic;

  constructor(apiKey: string) {
    this.anthropic = new Anthropic({ apiKey });
  }

  /**
   * Generate meeting minutes from transcript using Claude
   */
  async generate(
    transcript: string,
    templateName: keyof typeof TEMPLATES = 'default',
    context?: any,
    model: string = 'claude-sonnet-4-5-20250929'
  ): Promise<MeetingMinutes> {
    const template = TEMPLATES[templateName];

    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    const message = await this.anthropic.messages.create({
      model,
      max_tokens: 8192,
      temperature: 0.3,
      system: template.systemPrompt,
      messages: [
        {
          role: 'user',
          content: template.userPromptTemplate(transcript, context),
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    const text = content.text;

    // Extract JSON from response (Claude might wrap it in markdown)
    let jsonText = text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }

    const parsed = JSON.parse(jsonText);

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
      // Interview-specific fields
      candidateProfile: parsed.candidateProfile,
      candidateMotivation: parsed.candidateMotivation,
      candidateStrengths: parsed.candidateStrengths,
      availability: parsed.availability,
      concerns: parsed.concerns,
      aiEvaluation: parsed.aiEvaluation,
      interviewerNotes: parsed.interviewerNotes,
      rawTranscript: transcript,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate summary only (faster, cheaper)
   */
  async generateSummary(transcript: string, model: string = 'claude-haiku-4-5-20251015'): Promise<string> {
    const message = await this.anthropic.messages.create({
      model,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `以下の会議の文字起こしから、2-3文で簡潔な概要を作成してください：

${transcript}`,
        },
      ],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude');
    }

    return content.text;
  }
}

export function createClaudeMinutesGeneratorFromEnv(): ClaudeMinutesGenerator {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set in environment');
  }

  return new ClaudeMinutesGenerator(apiKey);
}
