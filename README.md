# AIMeet - AI-Powered Meeting Automation

自動議事録生成 & AI秘書システム for NPO運営

## Features

### Phase 1: MCP Calendar & Meet Secretary
- 自然言語でカレンダー予定作成
- Google Meet リンク自動付与
- 定例ミーティング設定
- 参加者自動招待

### Phase 2: Auto Meeting Minutes
- ✅ Google Meet Transcript 自動取得 (Workspace Pro)
- ✅ **Whisper API 音声ファイル文字起こし** (無料プランでも利用可能!)
- ✅ **Recall.ai AIボット自動録画・文字起こし** (完全自動!)
- ✅ OpenAI による要約・TODO抽出
- ✅ Notion / Slack 自動投稿
- ✅ NPO/行政向けテンプレート対応

### Phase 3: Full Integration (Planned)
- タスク管理連携
- 日次リマインド
- プロジェクト横断分析

## Architecture

```
flowchart LR
    User[User] --> MCP[MCP Server]
    MCP --> GCal[Google Calendar API]
    MCP --> GMeet[Google Meet API]

    Meet[Meeting] --> Event[Workspace Events]
    Event --> Backend[Transcript Processor]
    Backend --> OpenAI[OpenAI API]
    OpenAI --> Destinations[Notion/Docs/Slack]
```

## Quick Start

**超簡単な使い方: [README_SIMPLE.md](README_SIMPLE.md) をご覧ください**

### 最も簡単な使い方（Recall.ai Bot）

```bash
# たった1つのコマンド
./bot https://meet.google.com/xxx-xxxx-xxx
```

### 初回セットアップ

```bash
# 1. 依存関係をインストール
npm install

# 2. 環境変数を設定
cp .env.example .env
# .env を編集して API Keys を設定

# 3. Google アカウント認証（オプション）
npm run auth

# 4. ビルド
npm run build

# 5. 完了！
```

詳細な手順:
- [Getting Started Guide](GETTING_STARTED.md) - ステップバイステップガイド
- [Google Cloud Setup](docs/google-cloud-setup.md) - API 設定詳細
- [Quick Start (Phase 1)](docs/quickstart.md) - MCP カレンダー秘書
- [Phase 2 Guide](docs/phase2-transcript.md) - 自動議事録生成

## Usage Examples

### Phase 1: AI Calendar Secretary

Claude Desktop で自然言語で指示するだけ:

```
「明日の14:00から1時間、プロジェクト定例を入れて」
```

```
「来週水曜の10:00〜11:30で、理事会ミーティング。Google Meet で。」
```

```
「毎週火曜の19:00〜20:00で、ボランティア運営ミーティングを作って」
```

AI が自動的に:
- ✅ カレンダーイベント作成
- ✅ Google Meet リンク付与
- ✅ 参加者への招待メール送信

### Phase 2: Auto Meeting Minutes

#### Option A: Google Meet API (Workspace Pro)
会議終了後、CLI で:

```bash
npm run process-meeting -- --recent
```

#### Option B: Whisper API (無料プランOK!)
会議を録音して、音声ファイルを処理:

```bash
npm run process-meeting -- --audio meeting.mp3
```

**どちらの方法でも:**
1. ✅ Transcript 自動取得
2. ✅ OpenAI で要約生成 (Summary, Decisions, Action Items)
3. ✅ Notion データベースに保存
4. ✅ Slack チャンネルに通知

**出力例:**

```
📋 MEETING MINUTES
============================================================

📝 概要:
Open Coral Networkのボランティア定例ミーティング。
新規プログラムの企画検討と助成金申請状況を確認。

🎯 アクションアイテム:
  🔴 助成金の追加資料を提出 (山田) [2024-11-18]
  🟡 プログラム資料の作成 (佐藤) [2024-12-01]

📝 Notion: https://notion.so/page-id
📢 Slack: Posted
```

## Project Structure

```
aimeet/
├── src/
│   ├── mcp/
│   │   └── calendar-server.ts           # MCP Server for Calendar & Meet
│   ├── services/
│   │   ├── google-auth.ts               # Google OAuth 2.0 handler
│   │   ├── calendar.ts                  # Calendar API wrapper
│   │   ├── meet.ts                      # Meet API & Transcript
│   │   ├── workspace-events.ts          # Workspace Events subscription
│   │   ├── notion.ts                    # Notion API integration
│   │   └── slack.ts                     # Slack webhook integration
│   ├── processors/
│   │   ├── minutes-generator.ts         # OpenAI summarizer + templates
│   │   └── meeting-orchestrator.ts      # Workflow coordinator
│   ├── scripts/
│   │   ├── authenticate.ts              # Initial OAuth flow
│   │   └── process-meeting.ts           # CLI processing tool
│   └── index.ts
├── docs/
│   ├── google-cloud-setup.md            # Google Cloud configuration
│   ├── quickstart.md                    # Phase 1 quick start
│   ├── phase2-transcript.md             # Phase 2 detailed guide
│   └── architecture.md                  # System architecture
├── GETTING_STARTED.md                   # Step-by-step setup guide
└── README.md                            # This file
```

## Documentation

- **[Getting Started](GETTING_STARTED.md)** - 最速セットアップガイド (30分)
- **[Google Cloud Setup](docs/google-cloud-setup.md)** - API & OAuth 設定詳細
- **[Phase 1: Quick Start](docs/quickstart.md)** - MCP Calendar 秘書の使い方
- **[Phase 2: Auto Minutes](docs/phase2-transcript.md)** - 議事録自動化ガイド (Google Meet API)
- **[Whisper Integration](docs/whisper-guide.md)** - 音声ファイルから議事録生成 (無料プランOK!)
- **[Architecture](docs/architecture.md)** - システムアーキテクチャと設計思想
- **[Current Spec](docs/current-spec.md)** - 実装済み機能と今後の拡張要件の最新版仕様まとめ

## Roadmap

### Phase 1 ✅ (Complete)
- [x] Project setup & architecture
- [x] MCP Calendar & Meet server
- [x] OAuth 2.0 authentication flow
- [x] Calendar event CRUD operations
- [x] Google Meet link auto-generation
- [x] Claude Desktop integration
- [x] Recurring meetings support

### Phase 2 ✅ (Complete)
- [x] Meet API Transcript retrieval (Workspace Pro)
- [x] **Whisper API audio transcription (works with free plans!)**
- [x] Conference Record management
- [x] OpenAI GPT-4 summarization
- [x] Template system (default, NPO, government)
- [x] Notion API integration
- [x] Slack webhook integration
- [x] CLI processing tool with audio file support

### Phase 3 🚧 (In Progress)
- [ ] Workspace Events API webhook automation
- [ ] Cloud Run / Lambda deployment
- [ ] Pub/Sub event subscription
- [ ] Task management integration (ClickUp, Asana)
- [ ] Daily summary reports
- [ ] Weekly digest generation

### Future 📋 (Planned)
- [ ] Google Docs export
- [ ] Real-time transcription
- [ ] Multi-language support
- [ ] Custom AI model fine-tuning
- [ ] Dashboard UI
- [ ] Project cross-analysis
- [ ] Budget tracking integration

## License

MIT
