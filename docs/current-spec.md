# AIMeet 現状仕様（2025-11）

このドキュメントは、リポジトリに実装済みの機能と利用フローを俯瞰できるように整理した最新版の仕様書です。Phase 1〜2 の成果と、直近で追加する計画の機能を明記しています。

---

## 1. システム概要

### 1.1 コア目的
- Google Calendar/Meet の予定調整と会議録取得を自動化し、AI が議事録・TODO を生成。
- 生成物を Notion/Slack/ローカルファイルへ配信し、履歴を `Record/YYYY/MM/` 配下に保存。

### 1.2 主な構成
- **MCP Server**: `src/mcp/calendar-server.ts`  
  Claude Desktop 等の MCP クライアントから calendar/meet tool を提供（予定作成、更新、検索、削除）（`create_event` など6種）。
- **Meeting Orchestrator**: `src/processors/meeting-orchestrator.ts`  
  Transcript 取得 → AI 要約 → Notion/Slack 配信までをハブ化。Google Meet API / Whisper / Recall.ai の3経路をハンドリング。
- **AI Minutes Generators**: `src/processors/minutes-generator*.ts`  
  OpenAI GPT-4o を標準に、Gemini/Claude をスイッチ可能（`AI_PROVIDER`）。
- **Integrations**:  
  - Google Calendar (`src/services/calendar.ts`)  
  - Google Meet transcript API (`src/services/meet.ts`)  
  - Whisper 音声ファイル文字起こし (`src/services/whisper.ts`)  
  - Recall.ai Bot 録画 (`src/services/recall.ts`)  
  - Notion DB 投稿 (`src/services/notion.ts`)  
  - Slack Webhook 通知 (`src/services/slack.ts`)

---

## 2. ユースケースとフロー

### 2.1 予定作成（Phase 1 完了）
1. MCP クライアントから `create_event` を呼び出し、自然言語指示を構造化（`CalendarService.createEvent`）。
2. Google Calendar へイベント作成 + Meet リンク付与。
3. 定例設定（RRULE）、参加者招待、Meet URL の自動返信までをサポート。

### 2.2 議事録生成（Phase 2 完了）
| トランスクリプト取得経路 | コマンド例 | 備考 |
| --- | --- | --- |
| Google Meet API | `npm run process-meeting -- --recent` | Workspace Pro の transcript API（`MeetService.getFormattedTranscript`） |
| Whisper API | `npm run process-meeting -- --audio <file>` | mp3/mp4 等 25MB 以下。複数ファイル結合にも対応。 |
| Recall.ai Bot | `npm run process-meeting -- --meetUrl <url>` | Bot 参加・録画・文字起こし・完了待ちまで自動。`quick-record` で対話操作も可。 |

**生成物**  
- Minutes JSON（summary/keyPoints/decisions/actionItems/...）  
- Markdown/テキスト出力（`Record/YYYY/MM/meeting-*.md`）  
- Notion ページ（テンプレート化されたブロック）  
- Slack Block Kit メッセージ

### 2.3 配信
1. **Notion**: `createMeetingPage` が AI 要約・決定事項・アクションアイテムをブロックとして登録し、全文 transcript をトグルで添付。  
2. **Slack**: `postMeetingMinutes` がヘッダー、概要、TODO、Notion/Meet ボタンを含む Block メッセージを投稿。  
3. **ファイル出力**: `process-meeting` / `quick-record` が整形済み Markdown + JSON Raw を保存。次回会議アジェンダ (Mermaid) も自動生成可能。

---

## 3. 実装モジュール

| レイヤ | ファイル | 内容 |
| --- | --- | --- |
| 認証 | `src/services/google-auth.ts` | OAuth 2.0, token.json 管理, リフレッシュ処理。 |
| Calendar API | `src/services/calendar.ts` | CRUD, Meetリンク生成, 検索。 |
| Meet API | `src/services/meet.ts` | ConferenceRecord/Transcript API ラッパー。 |
| AI 要約 | `src/processors/minutes-generator*.ts` | テンプレート: default/NPO/government。JSON 形式で出力。 |
| CLI | `src/scripts/process-meeting.ts`, `src/scripts/quick-record.ts` | CLI パラメータ処理、対話プロンプト、保存ユーティリティ。 |
| Integrations | `src/services/notion.ts`, `src/services/slack.ts`, `src/services/whisper.ts`, `src/services/recall.ts` | 各 API 連携。 |

---

## 4. 設定とスクリプト

| 目的 | スクリプト | 備考 |
| --- | --- | --- |
| Google OAuth | `npm run auth` | ブラウザで承認 → token.json 保存。 |
| MCP サーバー | `npm run mcp:calendar` | Claude Desktop から工具呼び出し。 |
| 会議処理 | `npm run process-meeting -- [flags]` | `--list`, `--conference`, `--event`, `--recent`, `--audio`, `--meetUrl`, `--bot`, `--output`, `--template` 等。 |
| 手早い録画/処理 | `npm run record` | 対話 UI でカレンダー/Meet URL/音声を選択。 |
| Recall Bot 直送 | `npm run send-bot -- --meetUrl ...` | Bot だけ先に送り、後から `--bot` で処理も可。 |

**主要な .env 設定（値は省略）**
- Google OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`
- AI プロバイダ: `AI_PROVIDER` (`openai` / `gemini` / `claude`), 各 API Key
- Output 連携: `NOTION_API_KEY`, `NOTION_MEETING_DATABASE_ID`, `SLACK_WEBHOOK_URL`
- 自動録画: `RECALL_API_KEY`, `RECALL_REGION`

---

## 5. 既知の制約
- Meet transcript API は Workspace Business Standard 以上 + 会議中の手動トグル ON が必要。
- Whisper API は25MB/ファイル制限のため長時間録音は分割前提。
- Recall.ai Bot は Meet 参加者に「AIMeet Recorder」として表示され、待合室承認が必要。
- カレンダーイベント ↔ conferenceRecord の自動マッピングは簡易実装で、厳密一致には追加ロジックが必要（`MeetingOrchestrator.processMostRecentMeeting`）。

---

## 6. 追加予定機能（要件整理）

### 6.1 議事録タスクの自動実行 / GitHub Issues 連携
- ActionItems を `MeetingMinutes.actionItems` から抽出し、GitHub Issue を自動生成。  
- `.mcp.json` 既設の GitHub MCP サーバーを利用し、Issue 作成・更新を AI エージェント経由で呼び出せるようにする。  
- 将来的には ClickUp/Asana など Task API への抽象化インターフェースを `services/tasks.ts` として追加し、owner/deadline/priority を正規化。

### 6.2 タスク実行オートメーション
- 重要度 `high` のアクションについてはワークフローボット（GitHub Actions or Zapier）に回し、進捗チェック自動通知。  
- `process-meeting` 後に Webhook を発火し、CI/CD から各種スクリプトを起動できるように設計。

### 6.3 スマートスケジューリング（Google Sheets シフト × Calendar）
- Google Sheets API からメンバーのシフト票を取得（例: `Shift!A:D` にメール・稼働帯を格納）。  
- Google Calendar API で各メンバーの空き時間を検索し、候補スロットを生成。  
- AI（OpenAI/Gemini）で「メンバーの稼働帯・会議所要時間・優先順位」を考慮して最適候補を提案。  
- 候補採用後に `CalendarService.createEvent` を自動実行し、Slack/メールで通知。

### 6.4 ワークスペースイベント連携（Phase 3 項目）
- Workspace Events API + Pub/Sub Webhook を Cloud Run 等に設置し、会議終了 → transcript.fileGenerated イベントで `MeetingOrchestrator` を自動起動。  
- Recall.ai Bot の録画完了や Slack 通知失敗を Ops チャネルにアラートする監視も整備。

### 6.5 会計AIシステム（新規構想）
- **決済データ取得**  
  - Stripe、GMO Payment Gateway などの決済イベントを Webhook / REST API で取得し、統一スキーマ（支払元、金額、科目候補、タグ）に正規化。  
  - 複数通貨サポート、Fee/Tax ブレークダウンも保持。
- **AI 会計整理**  
  - OpenAI/Gemini で入出金の説明文を自動生成し、勘定科目・補助科目・プロジェクト等を推定。  
  - 例外ログをキューに積み、担当者が CLI/MCP で確認・修正できるワークフローを用意。
- **出力連携**  
  - Google スプレッドシート: 日次・月次で自動追記し、Pivot/チャート用シートを更新。  
  - Notion: 「会計レポート DB」「領収書 DB」を作成し、取引明細や領収書リンク、AI コメントをブロック化。
- **freee 連携**  
  - freee API で仕訳データを自動作成・更新。承認フローに入れるための Draft 状態で登録し、AI が推奨ステータスを付与。  
  - 会計期間の締め報告を自動生成し、Slack/メールへ送信。
- **監査/ログ**  
  - 取引ごとの原文（Webhook JSON、領収書URL）を保存し、後追い監査に利用。  
  - 失敗時は Ops Slack へ通知し、再処理キューに積む。

---

## 7. 導入ステップの推奨フロー
1. `.env` に Google / AI / Notion / Slack / Recall のキーを設定し、`npm install`→`npm run auth`→`npm run build`。
2. Claude Desktop で MCP サーバーを登録し、自然言語で予定作成を試す。
3. `npm run record` で Recall Bot / Whisper / Meet API のどれかを実行し、Record/Notion/Slack 出力を確認。
4. ActionItems を GitHub Issue へ変換する PoC（GitHub MCP server）を実装。
5. Google Sheets + Calendar のデータ取得を整備し、AI スケジューラを追加実装。

---

この仕様書をベースに、今後はタスク実行・GitHub issue 管理・空き状況を考慮した自動日程調整といった Phase 3 機能を追加していきます。
