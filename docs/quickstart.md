# Quick Start Guide - Phase 1: MCP Calendar Secretary

Phase 1 を使い始めるための最速ガイド

## ゴール

自然言語で AI に指示するだけで、Google Calendar のイベント作成・管理ができるようになります。

```
あなた: 「来週火曜の15:00〜16:00で、Open Coral Networkのボランティア定例ミーティングを作って。Google Meetで。」

AI: イベントを作成しました！
    📅 タイトル: Open Coral Network ボランティア定例
    🕒 日時: 2024-11-19 15:00-16:00 (JST)
    🔗 Meet: https://meet.google.com/xxx-xxxx-xxx
```

## セットアップ (初回のみ)

### 1. 依存関係のインストール

```bash
cd /Volumes/Extreme\ SSD/dev/aimeet
npm install
```

### 2. Google Cloud 設定

[google-cloud-setup.md](./google-cloud-setup.md) を参照して:

1. Google Cloud Project を作成
2. Google Calendar API を有効化
3. OAuth 2.0 認証情報を作成
4. Client ID と Client Secret を取得

### 3. 環境変数の設定

`.env` ファイルを作成:

```bash
cp .env.example .env
```

`.env` を編集して、Google 認証情報を設定:

```bash
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

### 4. Google アカウント認証

初回のみ、Google アカウントの認証が必要です:

```bash
npm run auth
```

ブラウザで認証画面が開くので:
1. Google アカウントでログイン
2. 権限を承認
3. リダイレクト URL から認証コードをコピー
4. ターミナルに貼り付け

成功すると `token.json` が生成されます。

### 5. ビルド

```bash
npm run build
```

### 6. Claude Desktop に MCP サーバーを登録

`~/Library/Application Support/Claude/claude_desktop_config.json` を編集:

```json
{
  "mcpServers": {
    "google-calendar-meet": {
      "command": "node",
      "args": ["/Volumes/Extreme SSD/dev/aimeet/dist/mcp/calendar-server.js"],
      "env": {
        "GOOGLE_CLIENT_ID": "your_client_id",
        "GOOGLE_CLIENT_SECRET": "your_secret",
        "GOOGLE_REDIRECT_URI": "http://localhost:3000/oauth2callback"
      }
    }
  }
}
```

**注意**: `env` で環境変数を直接指定するか、別途 `.env` を読み込むようにしてください。

### 7. Claude Desktop を再起動

設定を反映させるため、Claude Desktop を完全に再起動してください。

## 使い方

Claude Desktop で自然言語で指示するだけです！

### イベント作成の例

**基本的なイベント:**
```
「明日の14:00から1時間、プロジェクト定例を入れて」
```

**Meet リンク付き:**
```
「来週水曜の10:00〜11:30で、理事会ミーティング。Google Meet で。」
```

**参加者を招待:**
```
「金曜日の16:00から30分、山田さん(yamada@example.com)と1on1を設定して」
```

**定例ミーティング (毎週):**
```
「毎週火曜の19:00〜20:00で、ボランティア運営ミーティングを作って。Google Meet で。」
```

### その他の操作

**予定の確認:**
```
「今週の予定を教えて」
「来週の会議一覧を見せて」
```

**予定の検索:**
```
「Open Coral に関する予定を検索して」
```

**予定の更新:**
```
「明日の14:00の予定を15:00に変更して」
```

**予定の削除:**
```
「金曜日の1on1をキャンセルして」
```

## 利用可能な MCP ツール

AI は裏側で以下のツールを自動的に呼び出します:

| ツール名 | 説明 |
|---------|------|
| `create_event` | カレンダーイベント作成 (Meet リンク自動付与可) |
| `get_upcoming_events` | 今後の予定を取得 |
| `get_event` | 特定イベントの詳細取得 |
| `update_event` | イベント情報を更新 |
| `delete_event` | イベントを削除 |
| `search_events` | キーワードでイベント検索 |

## 定例ミーティングの設定

毎週・毎月の定例を設定する場合、recurrence ルールを使います:

**毎週火曜 19:00:**
```
「毎週火曜の19:00〜20:00で運営ミーティング」
→ AI が recurrence: ["RRULE:FREQ=WEEKLY;BYDAY=TU"] を自動生成
```

**隔週金曜:**
```
「隔週金曜の15:00から1時間、進捗報告会」
→ RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=FR
```

**毎月第1月曜:**
```
「毎月第1月曜の10:00から理事会」
→ RRULE:FREQ=MONTHLY;BYDAY=1MO
```

## トラブルシューティング

### "Not authenticated" エラー

```bash
npm run auth
```
で再認証してください。

### MCP サーバーが起動しない

1. ビルドが完了しているか確認:
   ```bash
   npm run build
   ```

2. `claude_desktop_config.json` のパスが正しいか確認

3. Claude Desktop のログを確認:
   ```bash
   tail -f ~/Library/Logs/Claude/mcp*.log
   ```

### Meet リンクが生成されない

1. Google Calendar API が有効化されているか確認
2. OAuth スコープに `calendar` が含まれているか確認
3. イベント作成時に `addMeetLink: true` が指定されているか

### Token の有効期限切れ

`token.json` を削除して再認証:

```bash
rm token.json
npm run auth
```

## 次のステップ

Phase 1 が動いたら、Phase 2 へ:

- [Phase 2: Meet Transcript & 自動議事録](./phase2-transcript.md)

Phase 2 では、会議が終わると自動的に:
1. Transcript を取得
2. OpenAI で要約
3. Notion / Slack に投稿

が行われます。
