# Google Cloud Setup Guide

AIMeet で必要な Google Cloud の設定手順

## 前提条件

- Google Workspace アカウント (Business Standard 以上推奨)
- Google Cloud Platform アカウント

## Step 1: Google Cloud Project 作成

1. [Google Cloud Console](https://console.cloud.google.com) にアクセス
2. 新しいプロジェクトを作成
   - プロジェクト名: `aimeet` (任意)
   - 組織: あなたの Google Workspace 組織を選択

## Step 2: 必要な API を有効化

以下の API を有効化してください:

### Phase 1 (MCP Secretary) に必須
- **Google Calendar API**
  - `https://console.cloud.google.com/apis/library/calendar-json.googleapis.com`

### Phase 2 (Auto Minutes) に必須
- **Google Meet API**
  - `https://console.cloud.google.com/apis/library/meet.googleapis.com`
- **Google Workspace Events API**
  - `https://console.cloud.google.com/apis/library/workspaceevents.googleapis.com`

### オプション (Google Docs 連携時)
- **Google Docs API**
  - `https://console.cloud.google.com/apis/library/docs.googleapis.com`
- **Google Drive API**
  - `https://console.cloud.google.com/apis/library/drive.googleapis.com`

## Step 3: OAuth 2.0 認証情報の作成

### 3-1. OAuth 同意画面の設定

1. 左メニュー → `APIとサービス` → `OAuth同意画面`
2. ユーザータイプ: `内部` (Workspace 組織内のみ) または `外部`
3. アプリ情報:
   - アプリ名: `AIMeet`
   - ユーザーサポートメール: あなたのメール
   - デベロッパーの連絡先: あなたのメール
4. スコープの追加:
   ```
   https://www.googleapis.com/auth/calendar
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/meetings.space.readonly
   ```

### 3-2. OAuth 2.0 クライアント ID の作成

1. 左メニュー → `APIとサービス` → `認証情報`
2. `認証情報を作成` → `OAuth クライアント ID`
3. アプリケーションの種類: `デスクトップアプリ`
4. 名前: `AIMeet MCP Client`
5. 作成後、以下をメモ:
   - **クライアント ID**
   - **クライアント シークレット**

### 3-3. リダイレクト URI の設定 (必要に応じて)

デスクトップアプリの場合、デフォルトで以下が使用されます:
```
http://localhost
urn:ietf:wg:oauth:2.0:oob
```

## Step 4: 認証情報を .env に設定

プロジェクトルートに `.env` ファイルを作成:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxx
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# その他の設定は .env.example を参照
```

## Step 5: 初回認証フロー

1. MCP サーバーを起動:
   ```bash
   npm run mcp:calendar
   ```

2. 初回起動時、ブラウザで認証画面が開きます
3. Google アカウントでログイン
4. 権限を承認
5. `token.json` が自動生成されます (このファイルは `.gitignore` 済み)

## Step 6: Google Workspace Admin 設定 (Phase 2)

Meet Transcript 機能を有効化するには、Workspace Admin が以下を設定:

1. [Google Admin Console](https://admin.google.com)
2. `アプリ` → `Google Workspace` → `Google Meet`
3. `録画と文字起こし` セクション:
   - ✅ **会議の文字起こしを許可する**
   - ✅ **文字起こしをデフォルトでオンにする** (オプション)
4. 設定を保存

## トラブルシューティング

### "Access Not Configured" エラー
- 該当する API が有効化されているか確認
- 数分待ってから再試行 (API 有効化には時間がかかる場合があります)

### "redirect_uri_mismatch" エラー
- OAuth クライアントのリダイレクト URI が一致しているか確認
- `.env` の `GOOGLE_REDIRECT_URI` を確認

### Token の有効期限切れ
- `token.json` を削除して再認証

### Meet Transcript が取得できない
- Google Workspace のプランが Business Standard 以上か確認
- Admin Console で文字起こし機能が有効か確認
- 会議中に手動で文字起こしをオンにしたか確認

## セキュリティのベストプラクティス

1. **認証情報の管理**
   - `.env` ファイルは絶対に Git にコミットしない
   - `credentials.json` も `.gitignore` に追加済み

2. **スコープの最小化**
   - 必要な権限のみを要求
   - 現在必要なスコープ:
     - `calendar` (カレンダー読み書き)
     - `meetings.space.readonly` (Meet 情報取得)

3. **トークンのローテーション**
   - 定期的に OAuth トークンを更新
   - Refresh token は安全に保管

## 参考リンク

- [Google Calendar API Documentation](https://developers.google.com/calendar/api/guides/overview)
- [Google Meet API Documentation](https://developers.google.com/meet/api)
- [Google Workspace Events API](https://developers.google.com/workspace/events)
- [OAuth 2.0 for Desktop Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
