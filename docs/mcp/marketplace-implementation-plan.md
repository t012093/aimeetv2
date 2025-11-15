# AIMeet MCP Marketplace 実装計画

> **作成日**: 2025-11-15
> **目的**: ClaudeやChatGPTのようなMCPマーケットプレイス機能の実装

---

## 🎯 概要

### 実装するもの

設定ページにMCPマーケットプレイスを追加し、ユーザーが：
1. 利用可能なMCPサーバー一覧を閲覧
2. 好きなサーバーを選択
3. 「Connect」ボタンをクリック
4. 外部サイトでOAuth認証（または、APIキー入力）
5. 自動的にMCP連携完了

### 参考にしたシステム
- Claude Desktop の Extension Marketplace
- ChatGPT の Plugin Marketplace
- 現在6490+のMCPサーバーが公開されているエコシステム

---

## 📊 現状分析

### 既存のMCPインフラ

**設定ファイル**: `.mcp.json`

現在、3つの外部MCPサーバーが設定済み：
1. **Notion MCP Server** (`@modelcontextprotocol/server-notion`)
2. **GitHub MCP Server** (`@modelcontextprotocol/server-github`)
3. **Brave Search MCP Server** (`@modelcontextprotocol/server-brave-search`)

**自作MCPサーバー**: `src/mcp/calendar-server.ts`
- Google Calendar & Meet の完全な実装
- 既に本番稼働中

### MCP化可能な既存サービス

| サービス | ファイル | 優先度 | 備考 |
|---------|---------|--------|------|
| Recall.ai | `src/services/recall.ts` | 🔴 最高 | 会議録画の中核機能 |
| Slack | `src/services/slack.ts` | 🟡 高 | 通知連携 |
| Notion | `src/services/notion.ts` | 🟢 中 | 既存MCPあり、拡張可能 |
| Google Meet | `src/services/meet.ts` | 🟢 中 | カレンダーMCPに統合可能 |
| Whisper | `src/services/whisper.ts` | 🔵 低 | 音声処理 |

---

## 🎨 UI/UX デザイン

### マーケットプレイスページ (`/marketplace`)

```
┌─────────────────────────────────────────────────────────────┐
│  🔍 Search MCP Servers...          [All Categories ▼]  [⚙️] │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Featured Servers                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 💬 Slack     │  │ 📝 Notion    │  │ 🔧 GitHub    │      │
│  │ Communication│  │ Note-taking  │  │ Code mgmt    │      │
│  │              │  │              │  │              │      │
│  │ 🟢 Connected │  │ 🟢 Connected │  │ 🔴 Connect   │      │
│  │ [Manage]     │  │ [Manage]     │  │ [Setup]      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  Available Servers                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 📁 Drive     │  │ 🗄️ PostgreSQL│  │ ✉️ Gmail     │      │
│  │ File storage │  │ Database     │  │ Email        │      │
│  │              │  │              │  │              │      │
│  │ 🔴 Connect   │  │ 🔴 Connect   │  │ 🔴 Connect   │      │
│  │ [Setup]      │  │ [Setup]      │  │ [Setup]      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ 🤖 Recall.ai │  │ 💳 Stripe    │  │ 📋 Linear    │      │
│  │ Meeting bot  │  │ Payments     │  │ Project mgmt │      │
│  │ [Official]   │  │              │  │              │      │
│  │ 🔴 Connect   │  │ 🔴 Connect   │  │ 🔴 Connect   │      │
│  │ [Setup]      │  │ [Setup]      │  │ [Setup]      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### サーバー詳細モーダル

クリックすると表示される詳細情報：

```
┌─────────────────────────────────────────────────────┐
│  💬 Slack MCP Server                    [× Close]   │
├─────────────────────────────────────────────────────┤
│                                                      │
│  By: Anthropic (Official)                           │
│  Category: Communication, Productivity              │
│  Version: 1.0.0                                     │
│  Downloads: 45,000                                  │
│                                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Overview │ Tools │ Configuration │ Docs     │   │
│  └─────────────────────────────────────────────┘   │
│                                                      │
│  📝 Description                                     │
│  Send messages, manage channels, and interact       │
│  with your Slack workspace. Perfect for team        │
│  notifications and automation.                      │
│                                                      │
│  ✨ Features                                        │
│  • Send messages to channels                        │
│  • Reply to threads                                 │
│  • Manage channels                                  │
│  • Search messages                                  │
│  • Add reactions                                    │
│                                                      │
│  🔐 Authentication                                  │
│  Type: OAuth 2.0                                    │
│  Scopes: channels:read, chat:write, users:read     │
│                                                      │
│  ┌──────────────────────────────────────────┐      │
│  │  🔴 Not Connected                        │      │
│  │                                          │      │
│  │  [Connect with Slack]                    │      │
│  └──────────────────────────────────────────┘      │
│                                                      │
│  [View Documentation]  [Test Connection]           │
└─────────────────────────────────────────────────────┘
```

### 接続フロー（OAuth）

```
User clicks "Connect with Slack"
         ↓
┌───────────────────────────┐
│  Connecting to Slack...   │
│  [Cancel]                 │
└───────────────────────────┘
         ↓
Opens new window → Slack OAuth page
         ↓
User logs in & grants permissions
         ↓
Window closes automatically
         ↓
┌───────────────────────────┐
│  ✅ Successfully Connected│
│  Slack is now available!  │
│  [Close]                  │
└───────────────────────────┘
         ↓
Card updates to show 🟢 Connected status
```

### 接続フロー（API Key）

```
User clicks "Connect"
         ↓
┌─────────────────────────────────────┐
│  Connect to GitHub                  │
├─────────────────────────────────────┤
│  API Key Authentication Required    │
│                                     │
│  Get your API key:                  │
│  1. Go to github.com/settings/tokens│
│  2. Generate new token              │
│  3. Select scopes: repo, read:org   │
│  4. Copy token                      │
│                                     │
│  [Get API Key on GitHub →]          │
│                                     │
│  API Key:                           │
│  [●●●●●●●●●●●●●●●●●●●●●●●●●]       │
│                                     │
│  [Test & Connect]  [Cancel]         │
└─────────────────────────────────────┘
         ↓
Backend validates token
         ↓
Success → Card shows 🟢 Connected
```

---

## 🛠️ 技術実装

### データベーススキーマ

```sql
-- MCPサーバーカタログ
CREATE TABLE mcp_servers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  server_id VARCHAR(255) UNIQUE NOT NULL,  -- e.g., "slack-mcp"
  name VARCHAR(255) NOT NULL,
  publisher VARCHAR(255),
  version VARCHAR(50),

  -- パッケージ情報
  package_type VARCHAR(50) NOT NULL,  -- npm, pypi, docker, custom
  package_identifier VARCHAR(255) NOT NULL,
  package_command TEXT NOT NULL,
  package_args JSONB,

  -- メタデータ
  description TEXT,
  long_description TEXT,
  category VARCHAR(100)[],
  tags VARCHAR(100)[],
  icon_url TEXT,

  -- 認証設定
  auth_type VARCHAR(50) NOT NULL,  -- oauth, api-key, service-account, none
  auth_provider VARCHAR(100),      -- google, github, slack, etc.
  auth_scopes TEXT[],
  auth_env_vars TEXT[],
  auth_instructions TEXT,

  -- ツール/機能
  tools JSONB,

  -- ステータス
  is_official BOOLEAN DEFAULT false,
  is_popular BOOLEAN DEFAULT false,
  downloads INTEGER DEFAULT 0,
  stars INTEGER DEFAULT 0,

  -- ドキュメント
  documentation_url TEXT,
  repository_url TEXT,
  examples JSONB,

  -- 要件
  requirements JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ユーザーのMCP接続
CREATE TABLE mcp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id VARCHAR(255) NOT NULL REFERENCES mcp_servers(server_id),

  -- 接続ステータス
  status VARCHAR(50) NOT NULL DEFAULT 'disconnected',
  error_message TEXT,

  -- メタデータ
  connected_at TIMESTAMP,
  last_used TIMESTAMP,
  usage_count INTEGER DEFAULT 0,

  -- カスタム設定
  config JSONB,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, server_id)
);

-- 暗号化された認証情報
CREATE TABLE mcp_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  server_id VARCHAR(255) NOT NULL REFERENCES mcp_servers(server_id),

  credential_type VARCHAR(50) NOT NULL,  -- oauth, api-key, service-account

  -- 暗号化されたデータ
  encrypted_access_token TEXT,
  encrypted_refresh_token TEXT,
  encrypted_api_key TEXT,
  encrypted_credentials TEXT,

  -- OAuthメタデータ
  token_expires_at TIMESTAMP,
  scopes TEXT[],

  -- ステータス
  status VARCHAR(50) NOT NULL DEFAULT 'active',

  -- セキュリティ
  encryption_key_id VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, server_id)
);

-- OAuth状態管理（CSRF保護）
CREATE TABLE oauth_states (
  state VARCHAR(255) PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  server_id VARCHAR(255) NOT NULL REFERENCES mcp_servers(server_id),

  -- PKCEパラメータ
  code_verifier VARCHAR(255) NOT NULL,
  code_challenge VARCHAR(255) NOT NULL,

  -- メタデータ
  redirect_uri TEXT NOT NULL,
  scopes TEXT[],

  -- 有効期限（10分）
  expires_at TIMESTAMP NOT NULL,

  created_at TIMESTAMP DEFAULT NOW()
);
```

### 初期データ（10個の人気MCPサーバー）

```sql
INSERT INTO mcp_servers (server_id, name, publisher, package_type, package_identifier, auth_type, category, description) VALUES
  ('slack', 'Slack', 'Anthropic', 'npm', '@modelcontextprotocol/server-slack', 'oauth', ARRAY['communication', 'productivity'], 'Send messages and manage Slack workspace'),
  ('notion', 'Notion', 'Notion Labs', 'npm', '@modelcontextprotocol/server-notion', 'api-key', ARRAY['productivity', 'documentation'], 'Create and manage Notion pages'),
  ('github', 'GitHub', 'Anthropic', 'npm', '@modelcontextprotocol/server-github', 'api-key', ARRAY['development', 'productivity'], 'Manage repositories and issues'),
  ('google-calendar', 'Google Calendar', 'AIMeet', 'custom', 'src/mcp/calendar-server.ts', 'oauth', ARRAY['productivity', 'scheduling'], 'Manage calendar and meetings'),
  ('google-drive', 'Google Drive', 'Anthropic', 'npm', '@modelcontextprotocol/server-google-drive', 'oauth', ARRAY['cloud-storage', 'productivity'], 'Access and manage Drive files'),
  ('postgres', 'PostgreSQL', 'Anthropic', 'npm', '@modelcontextprotocol/server-postgres', 'api-key', ARRAY['data', 'database'], 'Query PostgreSQL databases'),
  ('gmail', 'Gmail', 'Community', 'npm', 'gmail-mcp-server', 'oauth', ARRAY['communication', 'email'], 'Read and send emails'),
  ('stripe', 'Stripe', 'Anthropic', 'npm', '@modelcontextprotocol/server-stripe', 'api-key', ARRAY['business', 'payments'], 'Manage payments and customers'),
  ('linear', 'Linear', 'Community', 'npm', 'linear-mcp-server', 'api-key', ARRAY['productivity', 'project-management'], 'Manage issues and projects'),
  ('recall-ai', 'Recall.ai', 'AIMeet', 'custom', 'src/mcp/recall-server.ts', 'api-key', ARRAY['meeting-automation', 'ai'], 'Meeting recording bot management');
```

### フロントエンドコンポーネント構成

```
frontend/
├── app/
│   ├── marketplace/
│   │   ├── page.tsx                    # マーケットプレイスメイン
│   │   └── [serverId]/
│   │       └── page.tsx                # サーバー詳細ページ
│   └── settings/
│       └── page.tsx                    # 設定ページ（更新）
│
├── components/
│   └── mcp/
│       ├── ServerCard.tsx              # サーバーカード
│       ├── ServerGrid.tsx              # グリッドレイアウト
│       ├── ServerDetailModal.tsx       # 詳細モーダル
│       ├── ConnectionModal.tsx         # 接続モーダル
│       ├── OAuthFlow.tsx               # OAuth認証フロー
│       ├── ApiKeyForm.tsx              # APIキー入力フォーム
│       ├── ConnectionStatusBadge.tsx   # ステータス表示
│       └── CategoryFilter.tsx          # カテゴリフィルター
│
└── lib/
    └── mcp/
        ├── registry.ts                 # サーバーカタログ管理
        ├── auth.ts                     # 認証ロジック
        └── types.ts                    # 型定義
```

### バックエンドサービス構成

```
src/
├── mcp/
│   ├── calendar-server.ts              # 既存（Google Calendar）
│   ├── recall-server.ts                # 新規（Recall.ai）
│   └── slack-server.ts                 # 新規（Slack）
│
├── services/
│   ├── mcp-registry.ts                 # サーバーカタログ管理
│   ├── mcp-connection.ts               # 接続管理
│   ├── oauth-service.ts                # OAuth処理
│   ├── credential-store.ts             # 暗号化ストレージ
│   └── mcp-runner.ts                   # MCPサーバー実行管理
│
└── api/
    └── mcp/
        ├── servers.ts                  # サーバー一覧API
        ├── connect.ts                  # 接続API
        └── oauth.ts                    # OAuthコールバック
```

### API エンドポイント

```typescript
// サーバー管理
GET    /api/mcp/servers                 // サーバー一覧取得
GET    /api/mcp/servers/:serverId       // サーバー詳細取得
GET    /api/mcp/installed               // インストール済みサーバー一覧

// 接続管理
POST   /api/mcp/connect/:serverId       // サーバーに接続
POST   /api/mcp/disconnect/:serverId    // サーバーから切断
POST   /api/mcp/test/:serverId          // 接続テスト

// OAuth認証
POST   /api/mcp/oauth/:provider/authorize  // OAuth URL生成
POST   /api/mcp/oauth/callback             // OAuthコールバック処理
POST   /api/mcp/oauth/refresh/:serverId    // トークン更新

// 設定管理
PATCH  /api/mcp/config/:serverId        // サーバー設定更新
GET    /api/mcp/tools/:serverId         // 利用可能なツール一覧
```

---

## 🔐 セキュリティ実装

### OAuth 2.1 with PKCE

```typescript
// OAuth認証フロー（PKCE付き）
async function initiateOAuth(serverId: string) {
  // 1. PKCEパラメータ生成
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await sha256(codeVerifier);

  // 2. State生成（CSRF保護）
  const state = generateRandomString(32);

  // 3. データベースに保存
  await db.oauthStates.create({
    state,
    serverId,
    userId: currentUser.id,
    codeVerifier,
    codeChallenge,
    expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10分
  });

  // 4. OAuth URL生成
  const authUrl = buildOAuthUrl({
    clientId: config.clientId,
    redirectUri: config.redirectUri,
    scope: server.authScopes.join(' '),
    state,
    codeChallenge,
    codeChallengeMethod: 'S256',
  });

  return authUrl;
}

// OAuthコールバック処理
async function handleOAuthCallback(code: string, state: string) {
  // 1. State検証（CSRF保護）
  const savedState = await db.oauthStates.findOne({ state });
  if (!savedState || savedState.expiresAt < new Date()) {
    throw new Error('Invalid or expired state');
  }

  // 2. 認証コードをトークンに交換
  const tokens = await exchangeCodeForTokens({
    code,
    codeVerifier: savedState.codeVerifier,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
    redirectUri: config.redirectUri,
  });

  // 3. トークンを暗号化して保存
  await storeEncryptedTokens(
    savedState.userId,
    savedState.serverId,
    tokens
  );

  // 4. State削除
  await db.oauthStates.delete({ state });

  // 5. 接続ステータス更新
  await db.mcpConnections.update({
    userId: savedState.userId,
    serverId: savedState.serverId,
  }, {
    status: 'connected',
    connectedAt: new Date(),
  });
}
```

### 暗号化ストレージ

```typescript
// AES-256-GCM暗号化
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32; // 256 bits

function encrypt(plaintext: string, encryptionKey: Buffer): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, encryptionKey, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // IV + AuthTag + Ciphertext を結合
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

function decrypt(encryptedData: string, encryptionKey: Buffer): string {
  const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');

  const decipher = crypto.createDecipheriv(ALGORITHM, encryptionKey, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// トークン保存
async function storeEncryptedTokens(
  userId: string,
  serverId: string,
  tokens: OAuthTokens
) {
  const encryptionKey = getEncryptionKey(userId); // ユーザーごとの鍵

  await db.mcpCredentials.upsert({
    userId,
    serverId,
    credentialType: 'oauth',
    encryptedAccessToken: encrypt(tokens.accessToken, encryptionKey),
    encryptedRefreshToken: tokens.refreshToken
      ? encrypt(tokens.refreshToken, encryptionKey)
      : null,
    tokenExpiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
    scopes: tokens.scope.split(' '),
    status: 'active',
  });
}
```

### セキュリティチェックリスト

- ✅ OAuth 2.1 with PKCE（最新セキュリティ標準）
- ✅ State parameter でCSRF攻撃を防止
- ✅ トークンをAES-256-GCMで暗号化
- ✅ HTTPS必須（すべてのAPI通信）
- ✅ APIキーをマスク表示（UI上）
- ✅ トークンの有効期限管理
- ✅ 自動トークン更新（リフレッシュトークン）
- ✅ レート制限（API abuse防止）
- ✅ 監査ログ（すべての接続イベント）
- ✅ ユーザーごとの暗号化鍵
- ✅ パラメータ化されたクエリ（SQLインジェクション防止）
- ✅ 入力バリデーション
- ✅ エラーメッセージのサニタイズ

---

## 📅 実装スケジュール（2週間）

### Week 1: 基盤構築

**Day 1-2: データベース設計**
- [ ] PostgreSQL/SQLiteのセットアップ
- [ ] テーブル作成（mcp_servers, mcp_connections, mcp_credentials, oauth_states）
- [ ] インデックス作成
- [ ] 初期データ投入（10個のMCPサーバー）
- [ ] マイグレーションスクリプト作成

**Day 3-4: フロントエンドUI（基本）**
- [ ] マーケットプレイスページ作成 (`/marketplace`)
- [ ] ServerCard コンポーネント
- [ ] ServerGrid レイアウト
- [ ] 検索・フィルター機能
- [ ] レスポンシブデザイン

**Day 5: バックエンドAPI（基本）**
- [ ] GET `/api/mcp/servers` - サーバー一覧
- [ ] GET `/api/mcp/servers/:id` - サーバー詳細
- [ ] GET `/api/mcp/installed` - インストール済み
- [ ] ページネーション実装
- [ ] フィルター・ソート実装

### Week 2: 認証・接続機能

**Day 6-7: OAuth認証**
- [ ] OAuthService 実装
- [ ] PKCE生成・検証
- [ ] State管理（CSRF保護）
- [ ] POST `/api/mcp/oauth/:provider/authorize`
- [ ] POST `/api/mcp/oauth/callback`
- [ ] Google OAuth設定（カレンダー用）
- [ ] Slack OAuth設定

**Day 8-9: 暗号化ストレージ**
- [ ] CredentialStore サービス実装
- [ ] AES-256-GCM暗号化
- [ ] 鍵管理システム
- [ ] トークン保存・取得
- [ ] トークン自動更新

**Day 10-11: 接続管理**
- [ ] MCPConnectionManager 実装
- [ ] POST `/api/mcp/connect/:id`
- [ ] POST `/api/mcp/disconnect/:id`
- [ ] POST `/api/mcp/test/:id`
- [ ] 接続状態管理
- [ ] エラーハンドリング

**Day 12-13: UI統合**
- [ ] ConnectionModal コンポーネント
- [ ] OAuthFlow コンポーネント
- [ ] ApiKeyForm コンポーネント
- [ ] 接続成功・失敗の通知
- [ ] リアルタイムステータス更新

**Day 14: テスト・デバッグ**
- [ ] 単体テスト（主要サービス）
- [ ] 統合テスト（OAuth フロー）
- [ ] E2Eテスト（ユーザーフロー）
- [ ] セキュリティテスト
- [ ] バグ修正

---

## 🎯 優先実装サーバー

### Phase 1（MVP）: 5個

1. **Slack** - 既存の実装あり、OAuth
2. **Notion** - 既存の実装あり、API Key
3. **GitHub** - 既存の実装あり、API Key
4. **Google Calendar** - 既存の実装あり、OAuth
5. **Recall.ai** - 新規実装、API Key

### Phase 2（拡張）: 5個

6. **Google Drive** - OAuth
7. **PostgreSQL** - Connection String
8. **Gmail** - OAuth
9. **Stripe** - API Key
10. **Linear** - API Key

---

## 📊 成功指標（KPI）

### ユーザビリティ
- ✅ ユーザーが5分以内にMCPサーバーを接続できる
- ✅ OAuth認証成功率 95%以上
- ✅ 接続エラー率 5%以下
- ✅ ページロード時間 2秒以内

### セキュリティ
- ✅ すべてのトークンが暗号化されている
- ✅ CSRF攻撃への耐性テスト合格
- ✅ SQLインジェクション脆弱性なし
- ✅ XSS脆弱性なし

### 機能性
- ✅ 10個のMCPサーバーがマーケットプレイスで利用可能
- ✅ OAuth/APIキー両方のフローが動作
- ✅ 接続状態がリアルタイムで正確に表示
- ✅ トークンが自動更新される

---

## 🚀 将来の拡張（Post-MVP）

### Phase 3: 追加サーバー（+10個）
- Todoist（タスク管理）
- Discord（コミュニケーション）
- Figma（デザイン）
- Docker（開発）
- Firebase（データベース）
- など

### Phase 4: 高度な機能
- サーバー推奨システム（AI駆動）
- ワークフローテンプレート（複数サーバーの組み合わせ）
- 使用統計ダッシュボード
- チーム管理機能
- コスト追跡

### Phase 5: コミュニティ機能
- ユーザー投稿サーバー
- レビュー・評価システム
- カスタムサーバー作成ウィザード
- サーバーマーケットプレイス

---

## 📚 参考資料

### 公式ドキュメント
- [MCP Specification](https://modelcontextprotocol.io)
- [MCP Server Registry](https://registry.modelcontextprotocol.io)
- [Anthropic MCP Servers](https://github.com/modelcontextprotocol/servers)

### 技術リソース
- [OAuth 2.1 Specification](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-v2-1-07)
- [PKCE RFC 7636](https://datatracker.ietf.org/doc/html/rfc7636)
- [Node.js Crypto](https://nodejs.org/api/crypto.html)

### コミュニティ
- [MCP Servers Directory](https://mcpservers.org)
- [Claude Desktop Extensions](https://claude.ai/extensions)

---

## 📝 メモ・TODO

### 技術的決定事項
- データベース: PostgreSQLを使用（本番環境を想定）
- 暗号化: AES-256-GCM（業界標準）
- OAuth: 2.1 with PKCE（最新セキュリティ）
- フロントエンド: Next.js 14 + shadcn/ui（既存と統一）

### 未解決の質問
- [ ] データベースはPostgreSQLかSQLiteか？（環境に依存）
- [ ] トークン更新の頻度は？（サービスごとに異なる）
- [ ] サーバープロセスの管理方法は？（PM2? Docker?）
- [ ] ユーザー認証システムとの統合方法は？

### リスク
- OAuth実装の複雑さ（各プロバイダーで微妙に異なる）
- トークン有効期限管理（自動更新の実装）
- セキュリティ（暗号化、CSRF、SQLインジェクションなど）
- パフォーマンス（大量のサーバー起動時）

---

**最終更新**: 2025-11-15
**ステータス**: 計画完了、実装待ち
**次のステップ**: データベーススキーマ作成から開始
