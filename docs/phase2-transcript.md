# Phase 2: Auto Meeting Minutes

会議終了後に自動で議事録を生成・配信するシステム

## 概要

Phase 2 では以下が実現されます：

1. Google Meet で会議終了
2. Transcript（文字起こし）を Meet API で取得
3. OpenAI で要約・TODO抽出
4. Notion / Slack に自動投稿

## 前提条件

### Google Workspace 設定

1. **Workspace プラン**: Business Standard 以上
2. **Meet Transcript 機能の有効化**:
   - [Google Admin Console](https://admin.google.com) にアクセス
   - `アプリ` → `Google Workspace` → `Google Meet`
   - `録画と文字起こし` → ✅ **会議の文字起こしを許可する**

### API の有効化

[Google Cloud Console](https://console.cloud.google.com) で以下の API を有効化:

- ✅ Google Meet API
- ✅ Google Workspace Events API (自動化する場合)
- ✅ Google Calendar API (Phase 1 で設定済み)

### 追加の認証スコープ

`.env` に追加設定は不要ですが、OAuth スコープに以下が必要:

```
https://www.googleapis.com/auth/meetings.space.readonly
```

## セットアップ

### 1. 依存関係の追加インストール

既に Phase 1 で `npm install` を実行済みであれば不要です。

```bash
npm install
```

### 2. OpenAI API Key の設定

`.env` ファイルに追加:

```bash
OPENAI_API_KEY=sk-proj-...
```

### 3. Notion の設定 (オプション)

Notion に議事録を保存する場合:

1. [Notion Integrations](https://www.notion.so/my-integrations) で新しい Integration を作成
2. API キーを取得
3. 議事録用のデータベースを作成
4. データベースに Integration を招待
5. `.env` に設定:

```bash
NOTION_API_KEY=secret_...
NOTION_MEETING_DATABASE_ID=abc123...
```

**Notion データベースのプロパティ:**

| プロパティ名 | タイプ | 説明 |
|------------|--------|------|
| Name | Title | 会議名 |
| Date | Date | 会議日時 |
| Status | Select | ステータス (Completed, Updated など) |
| Meet Link | URL | Meet リンク (オプション) |
| Event ID | Text | Calendar イベント ID (オプション) |

### 4. Slack の設定 (オプション)

Slack に通知を送る場合:

1. [Slack App](https://api.slack.com/apps) で Incoming Webhook を作成
2. 投稿先チャンネルを選択 (例: `#meeting-notes`)
3. Webhook URL を取得
4. `.env` に設定:

```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
```

## 使い方

### 方法 1: CLI で手動実行

会議後に手動でコマンドを実行して議事録を生成:

#### 最近の会議を処理

```bash
npm run process-meeting -- --recent
```

#### 特定の Conference Record を処理

```bash
# 会議一覧を表示
npm run process-meeting -- --list

# 特定の会議を処理
npm run process-meeting -- --conference conferenceRecords/abc-defg-hij
```

#### Calendar Event から処理

```bash
npm run process-meeting -- --event my-calendar-event-id
```

#### テンプレートを指定

```bash
# NPO用テンプレート
npm run process-meeting -- --recent --template npo

# 行政向けテンプレート
npm run process-meeting -- --recent --template government
```

### 方法 2: プログラムから実行

TypeScript/Node.js プログラムから呼び出す:

```typescript
import { createAuthServiceFromEnv } from './services/google-auth.js';
import { createMinutesGeneratorFromEnv } from './processors/minutes-generator.js';
import { createOrchestratorFromEnv } from './processors/meeting-orchestrator.js';

const authService = createAuthServiceFromEnv();
await authService.loadToken();

const minutesGenerator = createMinutesGeneratorFromEnv();
const orchestrator = createOrchestratorFromEnv(authService, minutesGenerator);

// 会議を処理
const result = await orchestrator.processMeeting({
  conferenceRecordName: 'conferenceRecords/abc-defg',
  templateName: 'npo',
  context: {
    orgName: 'Open Coral Network',
    projectName: 'ボランティア運営',
  },
});

console.log('議事録URL:', result.notionUrl);
```

### 方法 3: Webhook で自動化 (推奨)

会議終了イベントを購読して完全自動化:

#### 3-1. Google Cloud Pub/Sub の設定

1. [Cloud Pub/Sub Console](https://console.cloud.google.com/cloudpubsub/topic/list) でトピックを作成
   - トピック名: `meet-events`

2. サービスアカウントに権限付与:
   - Pub/Sub Publisher
   - Pub/Sub Subscriber

#### 3-2. Workspace Events Subscription の作成

```typescript
import { WorkspaceEventsService, MEET_EVENT_TYPES } from './services/workspace-events.js';

const eventsService = new WorkspaceEventsService(authClient);

const subscription = await eventsService.createSubscription(
  '//meet.googleapis.com/spaces/*', // すべての Meet スペース
  [MEET_EVENT_TYPES.TRANSCRIPT_GENERATED], // Transcript 生成時にトリガー
  'projects/my-project/topics/meet-events' // Pub/Sub トピック
);

console.log('Subscription created:', subscription.name);
```

#### 3-3. Webhook サーバーの構築

Cloud Run や Lambda で Pub/Sub メッセージを受信:

```typescript
// Cloud Run example
import express from 'express';
import { parsePubSubMessage } from './services/workspace-events.js';

const app = express();
app.use(express.json());

app.post('/webhook/meet-events', async (req, res) => {
  const message = req.body.message;
  const event = parsePubSubMessage(message);

  if (event?.eventType === MEET_EVENT_TYPES.TRANSCRIPT_GENERATED) {
    // 議事録生成を開始
    await orchestrator.processMeeting({
      conferenceRecordName: event.conferenceRecord!,
      templateName: 'npo',
    });
  }

  res.status(200).send('OK');
});

app.listen(8080);
```

## 出力例

### コンソール出力

```
🚀 AIMeet - Meeting Processor

📊 Processing meeting: conferenceRecords/abc-defg
📝 Fetching transcript...
✅ Transcript retrieved (127 entries)
📅 Calendar event: Open Coral Network 定例ミーティング
🤖 Generating meeting minutes with AI...
✅ Minutes generated
📝 Creating Notion page...
✅ Notion page created: https://notion.so/page-id
📢 Posting to Slack...
✅ Posted to Slack
🎉 Meeting processing complete (0 errors)

============================================================
📋 MEETING MINUTES
============================================================

📝 概要:
Open Coral Networkのボランティア定例ミーティング。
新規プログラムの企画検討、助成金申請状況の確認、
次回イベントの役割分担について議論しました。

💡 重要なポイント:
  • 新規教育プログラムの試験実施を12月に決定
  • 助成金申請は第一次審査を通過
  • ボランティアメンバー3名が新規参加希望

✅ 決定事項:
  • 12月15日に新プログラムのパイロット実施
  • 次回ミーティングは11月20日 19:00

🎯 アクションアイテム:
  🔴 助成金の追加資料を提出 (山田) [2024-11-18]
  🟡 プログラム資料の作成 (佐藤) [2024-12-01]
  🟢 新規メンバーへの連絡 (田中)

📝 Notion: https://notion.so/page-id
📢 Slack: Posted

============================================================
```

### Notion ページ

構造化されたきれいな議事録ページが自動生成されます:

- 📝 概要
- 💡 重要なポイント (箇条書き)
- ✅ 決定事項 (箇条書き)
- 🎯 アクションアイテム (チェックボックス付き)
- 👥 参加者
- 📄 文字起こし全文 (折りたたみ)

### Slack メッセージ

チャンネルに自動投稿:

```
📋 Open Coral Network 定例ミーティング

[📝 議事録を見る] [🎥 Meet録画]

────────────────────────────

📝 概要
Open Coral Networkのボランティア定例ミーティング...

💡 重要なポイント
• 新規教育プログラムの試験実施を12月に決定
• 助成金申請は第一次審査を通過
...

🎯 アクションアイテム
🔴 助成金の追加資料を提出 (山田) [期限: 2024-11-18]
🟡 プログラム資料の作成 (佐藤) [期限: 2024-12-01]
...

🤖 AI生成 | 2024-11-13 18:30
```

## テンプレートのカスタマイズ

NPO の種類や用途に合わせて議事録テンプレートをカスタマイズできます。

### 新しいテンプレートの追加

[src/processors/minutes-generator.ts](../src/processors/minutes-generator.ts) に追加:

```typescript
export const VOLUNTEER_TEMPLATE: MinutesTemplate = {
  name: 'volunteer',
  systemPrompt: `ボランティア向け議事録を作成してください。
カジュアルで親しみやすい表現を使い、次のアクションを明確にしてください。`,
  userPromptTemplate: (transcript: string) => `
ボランティアミーティングの文字起こし:

${transcript}
`,
};

// TEMPLATESに登録
export const TEMPLATES = {
  default: DEFAULT_TEMPLATE,
  npo: NPO_TEMPLATE,
  government: GOVERNMENT_TEMPLATE,
  volunteer: VOLUNTEER_TEMPLATE, // 追加
};
```

使用:

```bash
npm run process-meeting -- --recent --template volunteer
```

## トラブルシューティング

### Transcript が見つからない

**原因:**
- 会議中に文字起こしが有効化されていなかった
- 会議が短すぎる（1分未満など）
- Admin Console で機能が無効

**解決策:**
1. 会議開始時に「文字起こしを開始」をクリック
2. Admin Console で機能が有効か確認
3. 数分待ってから再試行

### OpenAI エラー

**原因:**
- API Key が無効
- レート制限
- 文字起こしが長すぎる

**解決策:**
- `.env` の `OPENAI_API_KEY` を確認
- より小さいモデル (`gpt-4o-mini`) を使用
- 文字起こしを分割処理

### Notion 投稿失敗

**原因:**
- Integration が招待されていない
- データベース ID が間違っている
- プロパティ名が一致しない

**解決策:**
1. Notion データベースに Integration を招待
2. データベース ID (URL の最後の部分) を確認
3. [notion.ts](../src/services/notion.ts) のプロパティ名を調整

## 次のステップ: Phase 3

Phase 2 が動いたら、Phase 3 で以下を実装:

1. **タスク管理連携**
   - アクションアイテムを ClickUp / Asana / Notion Tasks に自動登録
   - 期限リマインダー

2. **日次サマリー**
   - 1日の会議を集約して夕方に Slack 投稿
   - 週次レポート生成

3. **プロジェクト横断分析**
   - 複数の議事録から共通課題を抽出
   - NPO 活動の KPI 追跡

4. **多言語対応**
   - 英語・中国語など多言語ボランティア向け
   - 自動翻訳機能

## 参考資料

- [Google Meet API - Transcripts](https://developers.google.com/meet/api/guides/transcript)
- [Workspace Events API](https://developers.google.com/workspace/events)
- [OpenAI API Documentation](https://platform.openai.com/docs/api-reference)
- [Notion API](https://developers.notion.com/)
- [Slack Incoming Webhooks](https://api.slack.com/messaging/webhooks)
