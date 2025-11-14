import OpenAI from 'openai';

export interface MeetingMinutes {
  summary: string;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItem[];
  participants: string[];
  unresolvedIssues?: UnresolvedIssue[];
  aiSuggestions?: AISuggestion[];
  timeline?: TimelineEntry[];
  risks?: Risk[];
  nextSteps?: string[];
  nextMeetingAgenda?: NextMeetingAgenda;
  rawTranscript: string;
  generatedAt: string;
}

export interface ActionItem {
  task: string;
  owner?: string;
  deadline?: string;
  priority?: 'high' | 'medium' | 'low';
  description?: string;
}

export interface UnresolvedIssue {
  issue: string;
  context: string;
  priority: 'high' | 'medium' | 'low';
  suggestedAction?: string;
}

export interface AISuggestion {
  category: 'process' | 'decision' | 'risk' | 'opportunity' | 'resource';
  suggestion: string;
  reasoning: string;
  priority: 'high' | 'medium' | 'low';
}

export interface TimelineEntry {
  milestone: string;
  deadline?: string;
  status: 'planned' | 'in-progress' | 'completed';
  dependencies?: string[];
}

export interface Risk {
  risk: string;
  impact: 'high' | 'medium' | 'low';
  likelihood: 'high' | 'medium' | 'low';
  mitigation?: string;
}

export interface NextMeetingAgenda {
  suggestedDate?: string;
  suggestedDuration?: number; // minutes
  objectives: string[];
  topics: AgendaTopic[];
  requiredParticipants: string[];
  optionalParticipants?: string[];
  preparationItems?: string[];
}

export interface AgendaTopic {
  title: string;
  description: string;
  estimatedDuration: number; // minutes
  presenter?: string;
  materials?: string[];
}

export interface MinutesTemplate {
  name: string;
  systemPrompt: string;
  userPromptTemplate: (transcript: string, context?: any) => string;
}

/**
 * Default template for general meetings
 */
export const DEFAULT_TEMPLATE: MinutesTemplate = {
  name: 'default',
  systemPrompt: `あなたは創造的思考を重視する議事録作成＆イノベーションアドバイザーです。会議の文字起こしから、構造化された議事録を生成し、AIとしての洞察と提案を追加してください。

**トーン&スタイル**:
- 形式的すぎず、親しみやすく読みやすい表現を使う
- 「〜する必要がある」より「〜してみませんか？」「〜すると良さそうです」
- 問題点だけでなく、可能性や機会に光を当てる
- クリエイティブな視点や新しい発想を歓迎する

以下の形式でJSON形式で出力してください：
{
  "summary": "会議の概要（2-3文）",
  "keyPoints": ["重要なポイント1", "重要なポイント2", ...],
  "decisions": ["決定事項1", "決定事項2", ...],
  "actionItems": [
    {
      "task": "タスク名",
      "description": "詳細な説明",
      "owner": "担当者（わかる場合）",
      "deadline": "期限（わかる場合、YYYY-MM-DD形式）",
      "priority": "high/medium/low"
    }
  ],
  "participants": ["参加者1", "参加者2", ...],
  "unresolvedIssues": [
    {
      "issue": "未解決の問題",
      "context": "議論された背景",
      "priority": "high/medium/low",
      "suggestedAction": "推奨される次のアクション"
    }
  ],
  "aiSuggestions": [
    {
      "category": "process/decision/risk/opportunity/resource",
      "suggestion": "具体的な提案",
      "reasoning": "なぜこの提案をするのか",
      "priority": "high/medium/low"
    }
  ],
  "timeline": [
    {
      "milestone": "マイルストーン名",
      "deadline": "YYYY-MM-DD",
      "status": "planned/in-progress/completed",
      "dependencies": ["依存する他のタスク"]
    }
  ],
  "risks": [
    {
      "risk": "リスクの内容",
      "impact": "high/medium/low",
      "likelihood": "high/medium/low",
      "mitigation": "軽減策"
    }
  ],
  "nextSteps": ["次のステップ1", "次のステップ2", ...],
  "nextMeetingAgenda": {
    "suggestedDate": "YYYY-MM-DD (今日の会議から推測)",
    "suggestedDuration": 60,
    "objectives": ["次回会議の目的1", "次回会議の目的2"],
    "topics": [
      {
        "title": "議題タイトル",
        "description": "議題の詳細説明",
        "estimatedDuration": 15,
        "presenter": "担当者（わかる場合）",
        "materials": ["必要な資料"]
      }
    ],
    "requiredParticipants": ["必須参加者1", "必須参加者2"],
    "optionalParticipants": ["任意参加者"],
    "preparationItems": ["事前準備事項1", "事前準備事項2"]
  }
}

重要な指示：
- **自然体でいこう**: 会議の内容に合わせて柔軟に。薄い内容の時は無理に項目を埋めなくてOK
- **各項目のガイドライン**:
  * unresolvedIssues: 「もう少し話し合いたいな」という話題があれば記載。前向きな表現で
  * aiSuggestions: 本当に役立ちそうなアイデアがあれば提案。無理に作らなくて大丈夫
  * timeline: スケジュールが出てきたら記載。ざっくりでもOK
  * risks: 「ここは気をつけた方がいいかも」という点があれば。脅かすのではなく、気づきを与える感じで
  * nextMeetingAgenda: 次に話したいことが見えてきたら提案。楽しみになるような書き方で
  * nextSteps: アクションアイテムと被る時はスキップしてOK
- **必須項目**: summary, keyPoints, participants, decisions（該当する場合）
- **推奨項目**: actionItems（アクションがある場合）
- **オプション項目**: その他すべて（内容がある場合のみ）
- **表現のポイント**:
  * 「〜しなければならない」→「〜してみると良さそう」
  * 「問題がある」→「改善のチャンスがありそう」
  * 「リスク」→「注意点」「気をつけたいポイント」
  * 可能性や機会を強調する前向きな言葉選び
- 絵文字は使わないでください（マークダウン側で追加します）
- 空の配列を返すのではなく、該当しない項目は省略してください`,
  userPromptTemplate: (transcript: string) => `以下の会議の文字起こしから、詳細な議事録とAI分析を作成してください：

${transcript}`,
};

/**
 * NPO運営会議用テンプレート
 */
export const NPO_TEMPLATE: MinutesTemplate = {
  name: 'npo',
  systemPrompt: `あなたはNPO運営の議事録作成専門家です。ボランティア団体の会議記録を作成します。

特に以下の点に注意してください：
- ボランティアメンバーの役割分担
- 予算・助成金関連の決定事項
- イベント・プログラムの企画内容
- 地域・行政との連携事項

JSON形式で出力してください（DEFAULT_TEMPLATEと同じ構造）。`,
  userPromptTemplate: (transcript: string, context?: any) => {
    const contextStr = context
      ? `\n\n【会議コンテキスト】\n団体名: ${context.orgName || '不明'}\nプロジェクト: ${context.projectName || '不明'}\n`
      : '';

    return `以下のNPO運営会議の文字起こしから議事録を作成してください：${contextStr}

${transcript}`;
  },
};

/**
 * 行政向け会議用テンプレート
 */
export const GOVERNMENT_TEMPLATE: MinutesTemplate = {
  name: 'government',
  systemPrompt: `あなたは行政向け会議の議事録作成専門家です。公式性・正確性を重視した記録を作成します。

特に以下の点に注意してください：
- 正式な決定事項と検討事項の明確な区別
- 予算・規制に関する言及の正確な記録
- 関係部署・担当者の明記
- フォローアップアクションの期限と責任者

JSON形式で出力してください（DEFAULT_TEMPLATEと同じ構造）。`,
  userPromptTemplate: (transcript: string, context?: any) => {
    const contextStr = context
      ? `\n\n【会議コンテキスト】\n部署: ${context.department || '不明'}\n案件: ${context.subject || '不明'}\n`
      : '';

    return `以下の行政会議の文字起こしから議事録を作成してください：${contextStr}

${transcript}`;
  },
};

export const TEMPLATES: Record<string, MinutesTemplate> = {
  default: DEFAULT_TEMPLATE,
  npo: NPO_TEMPLATE,
  government: GOVERNMENT_TEMPLATE,
};

export class MinutesGenerator {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  /**
   * Generate meeting minutes from transcript
   */
  async generate(
    transcript: string,
    templateName: keyof typeof TEMPLATES = 'default',
    context?: any,
    model: string = 'gpt-4o'
  ): Promise<MeetingMinutes> {
    const template = TEMPLATES[templateName];

    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }

    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: template.systemPrompt },
        { role: 'user', content: template.userPromptTemplate(transcript, context) },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3, // Lower temperature for more consistent output
    });

    const content = completion.choices[0].message.content;
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);

    return {
      summary: parsed.summary,
      keyPoints: parsed.keyPoints || [],
      decisions: parsed.decisions || [],
      actionItems: parsed.actionItems || [],
      participants: parsed.participants || [],
      unresolvedIssues: parsed.unresolvedIssues,
      aiSuggestions: parsed.aiSuggestions,
      timeline: parsed.timeline,
      risks: parsed.risks,
      nextSteps: parsed.nextSteps,
      nextMeetingAgenda: parsed.nextMeetingAgenda,
      rawTranscript: transcript,
      generatedAt: new Date().toISOString(),
    };
  }

  /**
   * Generate summary only (faster, cheaper)
   */
  async generateSummary(transcript: string, model: string = 'gpt-4o-mini'): Promise<string> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: '会議の文字起こしを簡潔に要約してください（3-5文）。',
        },
        { role: 'user', content: transcript },
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content || '';
  }

  /**
   * Extract action items only
   */
  async extractActionItems(
    transcript: string,
    model: string = 'gpt-4o-mini'
  ): Promise<ActionItem[]> {
    const completion = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'system',
          content: `文字起こしからアクションアイテム（TODO）を抽出してください。
JSON配列で出力：[{"task": "...", "owner": "...", "deadline": "...", "priority": "..."}]`,
        },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content;
    if (!content) return [];

    const parsed = JSON.parse(content);
    return parsed.actionItems || [];
  }
}

/**
 * Create MinutesGenerator from environment variable
 */
export function createMinutesGeneratorFromEnv(): MinutesGenerator {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('Missing OPENAI_API_KEY environment variable');
  }

  return new MinutesGenerator(apiKey);
}
