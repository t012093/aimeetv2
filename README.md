# 🤖 AIMeet - AI-Powered NPO Meeting Automation

**NPO運営を革新する、AI駆動の会議自動化・議事録作成システム**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 📖 目次

- [特徴](#-特徴)
- [デモ](#-デモ)
- [クイックスタート](#-クイックスタート)
- [セットアップ](#️-セットアップ)
- [使い方](#-使い方)
- [マルチプロジェクト対応](#-マルチプロジェクト対応)
- [ドキュメント](#-ドキュメント)
- [ロードマップ](#️-ロードマップ)
- [トラブルシューティング](#-トラブルシューティング)
- [貢献](#-貢献)

---

## ✨ 特徴

### 🎯 現在利用可能な機能

#### 📝 AI議事録自動生成
- **Recall.ai連携**: 会議に自動参加するAIボットが録画・文字起こし
- **マルチAI対応**: Claude / GPT-4 / Gemini から選択可能
- **柔軟な出力**: 会議内容に応じて自動調整（軽い会議は簡潔に、重要な会議は詳細に）
- **創造的なトーン**: 堅苦しくない、前向きで読みやすい表現

#### 📊 Notion統合
- **マルチプロジェクト対応**: 4つの専用データベース
  - 🌍 国際交流プロジェクト
  - 💻 子供プログラミング教室
  - 🎨 アート支援プロジェクト
  - 💼 面接（採用）プロジェクト
- **詳細なフォーマット**: テーブル、タイムライン、リスク分析など

#### 💬 Slack連携
- 議事録の自動投稿
- アクションアイテムの通知

#### 🎤 音声文字起こし
- Whisper API対応（音声ファイルから議事録生成）
- Google Meet Transcript（Workspace Pro）

---

## 🎬 デモ

### 1️⃣ たった1コマンドで会議を記録

```bash
./bot
```

対話形式で以下を選択：
- 録音方法（カレンダーイベント / Meet URL / 音声ファイル）
- プロジェクトタイプ（🌍国際交流 / 💻プログラミング / 🎨アート / 💼面接）

AIボットが会議に参加 → 自動録画 → 文字起こし → 議事録生成 → プロジェクト別にNotion/Slack投稿

### 2️⃣ プロジェクトごとに自動振り分け

選択したプロジェクトタイプに応じて：
- 専用Notionデータベースに保存
- 専用Slackチャンネルに通知
- プロジェクト固有のフォーマットで出力

### 3️⃣ 会議終了後の処理

```bash
npm run process-meeting -- --bot <bot-id>
```

録音開始時に選択したプロジェクトタイプがBotメタデータから自動的に復元されます

---

## 🚀 クイックスタート

### 必要なもの

- Node.js 18以上
- npm または yarn
- Recall.ai アカウント（無料プランあり）
- Notion アカウント
- Claude / OpenAI / Gemini APIキー（いずれか1つ）

### 5分でセットアップ

```bash
# 1. リポジトリをクローン
git clone https://github.com/t012093/aimeetv2.git
cd aimeetv2

# 2. 依存関係をインストール
npm install

# 3. 環境変数を設定
cp .env.example .env
# .envを編集してAPIキーを設定

# 4. ビルド
npm run build

# 5. 完了！早速使ってみましょう
./bot
```

---

## ⚙️ セットアップ

### 1. 環境変数の設定

`.env` ファイルを作成し、以下を設定：

```bash
# AI Provider (claude, openai, or gemini)
AI_PROVIDER=claude

# Anthropic Claude
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx

# または OpenAI
OPENAI_API_KEY=sk-proj-xxxxx

# または Google Gemini
GEMINI_API_KEY=AIzaSyxxxxx

# Notion
NOTION_API_KEY=ntn_xxxxx
NOTION_MEETING_DATABASE_ID=xxxxx  # デフォルトDB

# プロジェクト別データベース（オプション）
NOTION_INTERNATIONAL_DATABASE_ID=xxxxx
NOTION_PROGRAMMING_DATABASE_ID=xxxxx
NOTION_ART_DATABASE_ID=xxxxx
NOTION_INTERVIEW_DATABASE_ID=xxxxx

# Slack（オプション）
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxx

# Recall.ai
RECALL_API_KEY=xxxxx
RECALL_REGION=us-west-2
```

### 2. Notion データベースの準備

1. Notionで新しいデータベースを作成
2. 最低限必要なプロパティ:
   - `Name` (Title): ページタイトル
3. データベースIDをURLから取得
   - 例: `https://notion.so/1c5e773472ce80788fd0d1e3812ea0d4?v=...`
   - → `1c5e773472ce80788fd0d1e3812ea0d4` がデータベースID

詳細: [マルチプロジェクトセットアップガイド](docs/multi-project-setup.md)

### 3. Recall.ai APIキーの取得

1. [Recall.ai](https://www.recall.ai/) でアカウント作成
2. APIキーを発行
3. `.env` に `RECALL_API_KEY` として設定

詳細: [Recall.ai統合ガイド](docs/recall-integration.md)

---

## 💡 使い方

### パターン1: インタラクティブモード（最もシンプル・推奨）

```bash
./bot
```

対話形式で以下を選択：
1. 録音方法（カレンダー / URL / 音声ファイル）
2. ミーティングを選択
3. **プロジェクトタイプを選択**
   - 🌍 国際交流
   - 💻 プログラミング教室
   - 🎨 アート支援
   - 💼 面接
   - 📋 デフォルト

ボットが会議に参加し、自動的に：
- 📹 録画
- 🎤 文字起こし
- 🤖 AI議事録生成
- 📝 Notion投稿（プロジェクト別DB）
- 💬 Slack通知（プロジェクト別チャンネル）

---

### パターン2: リアルタイム会議記録（CLIモード）

会議開始前または開始直後に：

```bash
npm run record
```

対話形式で設定を選択し、ボットを送信。

会議終了後：

```bash
# 最新の会議から議事録を取得
npm run process-meeting -- --bot <bot-id>
```

---

### パターン3: 録音済み音声から議事録作成

会議を録音していた場合：

```bash
npm run process-meeting -- --audio meeting.mp3
```

---

### パターン4: Google Meet Transcript（Workspace Pro限定）

```bash
npm run process-meeting -- --recent
```

---

### プロジェクト指定（手動モード）

特定のプロジェクトのNotionデータベースに保存：

```bash
# 国際交流プロジェクト
npm run process-meeting -- --bot <bot-id> --project international

# 子供プログラミング教室
npm run process-meeting -- --bot <bot-id> --project programming

# アート支援プロジェクト
npm run process-meeting -- --bot <bot-id> --project art

# 面接（採用）プロジェクト
npm run process-meeting -- --bot <bot-id> --project interview
```

**注**: `./bot` を使えば、プロジェクトタイプを対話形式で選択できるため、`--project` フラグは不要です。

---

## 🎨 マルチプロジェクト対応

AIMeetは複数のNPOプロジェクトを並行管理できます。

### 設定されているプロジェクト

| プロジェクト | 説明 | コマンド |
|:-----------|:-----|:---------|
| 🌍 国際交流 | 国際交流・異文化理解プログラム | `--project international` |
| 💻 プログラミング | 子供向けプログラミング教室 | `--project programming` |
| 🎨 アート支援 | アート・文化支援活動 | `--project art` |
| 💼 面接 | 採用・面接プロセス | `--project interview` |
| 📋 デフォルト | 一般的な会議 | `--project default` または省略 |

### 使い分けの例

```bash
# 国際交流チームの定例会議
./bot https://meet.google.com/intl-team-meeting
# 会議後
npm run process-meeting -- --bot <bot-id> --project international

# プログラミング教室の講師ミーティング
./bot https://meet.google.com/prog-teachers
# 会議後
npm run process-meeting -- --bot <bot-id> --project programming
```

詳細: [マルチプロジェクトセットアップガイド](docs/multi-project-setup.md)

---

## 📚 ドキュメント

### 📘 セットアップガイド
- [Getting Started](GETTING_STARTED.md) - ステップバイステップのセットアップ
- [Google Cloud Setup](docs/google-cloud-setup.md) - Google API設定（オプション）
- [マルチプロジェクト設定](docs/multi-project-setup.md) - 複数データベース管理

### 📗 使い方ガイド
- [Quick Start](QUICK_START.md) - 最速で使い始める
- [Recall.ai統合](docs/recall-integration.md) - AIボットの使い方
- [Whisper統合](docs/whisper-guide.md) - 音声ファイルから議事録生成

### 📙 技術ドキュメント
- [アーキテクチャ](docs/architecture.md) - システム設計
- [現在の仕様](docs/current-spec.md) - 実装済み機能一覧
- [将来構想ロードマップ](docs/future-roadmap.md) - Phase 3-7の計画

---

## 🗺️ ロードマップ

### ✅ Phase 1 & 2: 基本機能（完了）
- AI議事録自動生成
- Notion/Slack連携
- マルチプロジェクト対応
- 柔軟な出力フォーマット

### 🚧 Phase 3: タスク管理（計画中）
- GitHub Issues自動連携
- アクションアイテムのIssue化
- タスク進捗トラッキング

### 📅 Phase 4: AIスケジュール調整（計画中）
- Googleカレンダー統合
- スプレッドシートからメンバー情報取得
- AI駆動の最適日程提案

### 💰 Phase 5: 会計AI自動化（計画中）
- Stripe/GMO Payment連携
- AI自動仕訳
- freee統合

### 💬 Phase 6: Slack高度連携（計画中）
- 議事録自動共有
- トーク要約機能
- 対話型ボット

### 🔗 Phase 7: ブロックチェーン報酬（長期）
- AI貢献度評価
- トークン報酬自動配布
- DAOガバナンス

詳細: [将来構想ロードマップ](docs/future-roadmap.md)

---

## 📊 出力例

### Notion議事録ページ

```
📅 日付: 2025年11月14日 03:54
👥 参加者: Network Coral, かおや

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 概要
OpenAIの議事録作成機能のテストを実施。複数デバイスからの
参加時における音声認識の精度検証が主な目的。

💡 重要なポイント
✨ OpenAI要約機能を活用した議事録作成のテスト実施
✨ 複数アカウント・複数デバイスでの会議参加が必要
✨ スマートフォンから発話、PCで出力されない状態での検証

✅ 決定事項
✔️ テストのために別アカウントでミーティングに参加する
✔️ スマートフォンからの音声入力テストを実施する

🎯 アクションアイテム
┌──────┬────────────────┬────────┬──────┬──────┐
│優先度│タスク          │担当者  │期限  │状態  │
├──────┼────────────────┼────────┼──────┼──────┤
│🔴    │複数デバイステスト│かおや  │未定  │⬜    │
│🟡    │評価基準策定    │未定    │未定  │⬜    │
└──────┴────────────────┴────────┴──────┴──────┘

⚠️ 未解決事項
🔴 1. 音声認識精度の検証方法
   📌 背景: 具体的な評価方法が未定
   💡 推奨: 定量的な評価指標を設定

🤖 AIからの提案・アドバイス
⚙️ 1. 段階的テストアプローチの採用 [重要]
   理由: 問題の切り分けが容易になり、より正確な原因分析が可能

🚀 次のステップ
1. スマートフォンとPCの両方から会議に参加する
2. テスト結果を分析し、精度を定量的に評価する
```

---

## 🔧 トラブルシューティング

### よくある問題

#### ❌ `Missing NOTION_API_KEY or NOTION_MEETING_DATABASE_ID`

**原因**: 環境変数が設定されていない

**解決方法**:
```bash
# .envファイルを確認
cat .env

# 必要な変数が設定されているか確認
echo $NOTION_API_KEY
echo $NOTION_MEETING_DATABASE_ID
```

---

#### ❌ `body failed validation: database_id should be a valid uuid`

**原因**: NotionデータベースIDが正しくない

**解決方法**:
1. NotionでデータベースのURLを確認
2. `https://notion.so/DATABASE_ID?v=...` の `DATABASE_ID` 部分をコピー
3. `.env` の該当する変数に設定

---

#### ❌ Recall.aiボットが会議に参加できない

**原因**: Meet URLが正しくない、または会議がロックされている

**解決方法**:
1. Meet URLが正しいか確認
2. 会議の参加設定を確認（組織外のユーザーを許可）
3. ボットが参加リクエストを送った際に、手動で承認

---

#### ❌ AI生成の議事録が空または不完全

**原因**: 音声認識が失敗、またはAPIの制限

**解決方法**:
1. 音声品質を確認（雑音が多くないか）
2. APIキーの使用量制限を確認
3. 別のAIプロバイダーを試す（Claude → GPT-4など）

---

### ログの確認

```bash
# 詳細なログを表示
npm run process-meeting -- --bot <bot-id> 2>&1 | tee meeting.log
```

---

## 🤝 貢献

### バグ報告・機能リクエスト

[GitHub Issues](https://github.com/t012093/aimeetv2/issues) で報告してください。

### プルリクエスト

1. フォーク
2. フィーチャーブランチ作成 (`git checkout -b feature/amazing-feature`)
3. コミット (`git commit -m 'Add amazing feature'`)
4. プッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

---

## 📞 サポート

- **ドキュメント**: [docs/](docs/)
- **Issues**: [GitHub Issues](https://github.com/t012093/aimeetv2/issues)
- **ディスカッション**: [GitHub Discussions](https://github.com/t012093/aimeetv2/discussions)

---

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照

---

## 🙏 謝辞

このプロジェクトは以下の素晴らしいオープンソースプロジェクトに支えられています：

- [Recall.ai](https://www.recall.ai/) - 会議録画・文字起こし
- [Anthropic Claude](https://www.anthropic.com/) - AI議事録生成
- [OpenAI](https://openai.com/) - GPT-4 & Whisper
- [Notion API](https://developers.notion.com/) - データベース統合
- [Google APIs](https://developers.google.com/) - Calendar & Meet

---

<div align="center">

**🚀 NPO運営を、もっとスマートに。**

Made with ❤️ by the AIMeet Team

[Getting Started](GETTING_STARTED.md) · [Documentation](docs/) · [Roadmap](docs/future-roadmap.md)

</div>
