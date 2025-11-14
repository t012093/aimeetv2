# Getting Started with AIMeet

最速で動かすためのステップバイステップガイド

## 🎯 目標

このガイドを完了すると：

✅ AIに自然言語で指示してカレンダーイベントを作成できる
✅ 会議の文字起こしから自動で議事録を生成できる
✅ Notion と Slack に議事録が自動投稿される

所要時間: **約30分**

---

## ステップ 1: 依存関係のインストール (5分)

### 1-1. Node.js の確認

```bash
node --version  # v18.0.0 以上
npm --version
```

### 1-2. プロジェクトの依存関係をインストール

```bash
cd /Volumes/Extreme\ SSD/dev/aimeet
npm install
```

---

## ステップ 2: Google Cloud の設定 (15分)

### 2-1. Google Cloud Project を作成

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成: `aimeet`

### 2-2. 必要な API を有効化

以下のリンクから API を有効化:

- [Google Calendar API](https://console.cloud.google.com/apis/library/calendar-json.googleapis.com)
- [Google Meet API](https://console.cloud.google.com/apis/library/meet.googleapis.com)
- [Google Workspace Events API](https://console.cloud.google.com/apis/library/workspaceevents.googleapis.com)

### 2-3. OAuth 2.0 認証情報を作成

1. [認証情報ページ](https://console.cloud.google.com/apis/credentials) に移動
2. `認証情報を作成` → `OAuth クライアント ID`
3. アプリケーションの種類: **デスクトップアプリ**
4. 名前: `AIMeet Desktop`
5. 作成後、**クライアント ID** と **クライアント シークレット** をメモ

### 2-4. OAuth 同意画面の設定

1. [OAuth 同意画面](https://console.cloud.google.com/apis/credentials/consent) に移動
2. ユーザータイプ: **内部** (Workspace 組織の場合) または **外部**
3. アプリ名: `AIMeet`
4. スコープの追加は不要（自動で追加されます）

詳細: [docs/google-cloud-setup.md](docs/google-cloud-setup.md)

---

## ステップ 3: 環境変数の設定 (3分)

### 3-1. .env ファイルを作成

```bash
cp .env.example .env
```

### 3-2. .env を編集

```bash
# Google OAuth (必須)
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx

# OpenAI (Phase 2 で必須)
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# Notion (オプション)
NOTION_API_KEY=secret_xxxxxxxxxxxxx
NOTION_MEETING_DATABASE_ID=abc123def456

# Slack (オプション)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T.../B.../xxx
```

**最低限必要なもの (Phase 1):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

**Phase 2 も試す場合は追加:**
- `OPENAI_API_KEY`

---

## ステップ 4: Google アカウントを認証 (2分)

```bash
npm run auth
```

1. ブラウザで認証画面が開く
2. Google アカウントでログイン
3. 権限を承認
4. リダイレクト URL から**認証コード**をコピー
5. ターミナルに貼り付け

成功すると：
```
✅ Authentication successful!
🎉 Token saved to token.json
```

---

## ステップ 5: ビルド (1分)

```bash
npm run build
```

---

## ステップ 6: Phase 1 を試す (3分)

### 6-1. Claude Desktop に MCP サーバーを登録

`~/Library/Application Support/Claude/claude_desktop_config.json` を作成/編集:

```json
{
  "mcpServers": {
    "google-calendar-meet": {
      "command": "node",
      "args": ["/Volumes/Extreme SSD/dev/aimeet/dist/mcp/calendar-server.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your-client-id-here",
        "GOOGLE_CLIENT_SECRET": "your-client-secret-here"
      }
    }
  }
}
```

**重要**: `env` 内の値を実際の認証情報に置き換えてください。

### 6-2. Claude Desktop を再起動

完全に終了してから再起動:

```bash
# macOS
killall Claude
open -a Claude
```

### 6-3. 自然言語でカレンダーを操作

Claude Desktop で試してみましょう：

```
明日の14:00から1時間、プロジェクト定例を入れて。Google Meet で。
```

```
来週の予定を教えて
```

```
毎週火曜の19:00から運営ミーティングを定例で作って
```

成功すると、カレンダーにイベントが作成され、Meet リンクが付与されます！

詳細: [docs/quickstart.md](docs/quickstart.md)

---

## ステップ 7: Phase 2 を試す (オプション)

Phase 2 では会議の文字起こしから議事録を自動生成します。

### 7-1. OpenAI API Key を設定

`.env` に追加:
```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
```

### 7-2. Google Workspace で文字起こしを有効化

1. [Google Admin Console](https://admin.google.com) にアクセス
2. `アプリ` → `Google Workspace` → `Google Meet`
3. `録画と文字起こし`:
   - ✅ **会議の文字起こしを許可する**

### 7-3. テスト会議を実施

1. Google Meet で短いテスト会議を開催 (3-5分)
2. 会議中に「文字起こしを開始」をクリック
3. 会議を終了

### 7-4. 議事録を生成

```bash
# 最近の会議を処理
npm run process-meeting -- --recent

# または特定の会議を指定
npm run process-meeting -- --list  # 会議一覧を表示
npm run process-meeting -- --conference conferenceRecords/abc-defg
```

出力例:
```
📋 MEETING MINUTES
============================================================

📝 概要:
プロジェクト定例ミーティング。進捗確認と次週のタスク割り当てを実施。

💡 重要なポイント:
  • 開発フェーズ1が予定通り完了
  • ユーザーテストは来週開始

🎯 アクションアイテム:
  🔴 テスト環境の準備 (山田) [2024-11-20]
  🟡 ドキュメント更新 (佐藤)

📝 Notion: https://notion.so/page-id
📢 Slack: Posted
```

詳細: [docs/phase2-transcript.md](docs/phase2-transcript.md)

---

## トラブルシューティング

### "Not authenticated" エラー

```bash
rm token.json
npm run auth
```

### MCP サーバーが起動しない

1. ビルドを確認: `npm run build`
2. Claude Desktop のログを確認:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

### Transcript が見つからない

- 会議中に「文字起こしを開始」を手動でクリック
- Google Workspace の設定を確認
- 会議終了後、数分待ってから再試行

### OpenAI API エラー

- `.env` の `OPENAI_API_KEY` を確認
- API キーの使用量制限を確認

---

## 次のステップ

### ✅ Phase 1 が動いた場合

- 定例ミーティングを設定してみる
- 複数の参加者を招待してみる
- カレンダーイベントの検索・更新を試す

### ✅ Phase 2 が動いた場合

- Notion 連携を設定: [Notion Setup](docs/phase2-transcript.md#3-notion-の設定-オプション)
- Slack 連携を設定: [Slack Setup](docs/phase2-transcript.md#4-slack-の設定-オプション)
- カスタムテンプレートを作成

### 📋 Phase 3 に向けて

- Workspace Events で自動化
- Cloud Run にデプロイ
- タスク管理ツールと連携

---

## サポート

質問や問題がある場合:

1. [docs/](docs/) ディレクトリの詳細ドキュメントを確認
2. [GitHub Issues](https://github.com/your-org/aimeet/issues) で報告
3. [アーキテクチャドキュメント](docs/architecture.md) を参照

---

## 成功！🎉

Phase 1 と Phase 2 が動いたら、あなたは：

✅ AIに自然言語で指示してカレンダーを操作できる
✅ 会議が終わると自動で議事録が生成される
✅ Notion と Slack に議事録が届く

NPO 運営の事務作業が大幅に削減されます！
