# SIFUT Backend API

<div align="center">

**NPOシフト管理・ミーティング調整システム「SIFUT」のFastAPIバックエンド**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115.0-009688.svg?style=flat&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg?style=flat&logo=python&logoColor=white)](https://www.python.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791.svg?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📑 目次

- [概要](#概要)
- [主な機能](#主な機能)
- [技術スタック](#技術スタック)
- [前提条件](#前提条件)
- [クイックスタート](#クイックスタート)
- [詳細セットアップ](#詳細セットアップ)
- [環境変数](#環境変数)
- [API エンドポイント](#api-エンドポイント)
- [フロントエンド統合](#フロントエンド統合)
- [データベース構造](#データベース構造)
- [プロジェクト構成](#プロジェクト構成)
- [開発ワークフロー](#開発ワークフロー)
- [デプロイメント](#デプロイメント)
- [トラブルシューティング](#トラブルシューティング)

---

## 🎯 概要

**SIFUT**（Shift Integration & Facilitation Unified Tool）は、NPO組織向けのシフト管理とミーティング調整を統合したWebアプリケーションです。

### 解決する課題

- ✅ メンバーのシフト希望の収集と管理の自動化
- ✅ LLMによるシフトの最適配置
- ✅ Google CalendarとGoogle Meetの自動連携
- ✅ プロジェクト別のリソース管理
- ✅ ミーティング調整の効率化

---

## ✨ 主な機能

### 🔐 認証システム
- Google OAuth 2.0 によるソーシャルログイン
- JWT（JSON Web Token）ベースの認証
- リフレッシュトークンによる長期セッション管理
- ロールベースアクセス制御（admin / member）

### 📅 シフト管理
- シフト希望の作成・編集・削除
- 提出・承認ワークフロー
- 確定シフトの一括管理
- 日付範囲・ステータスによる柔軟な検索

### 🤖 LLM最適化エンジン
- **Claude 3.5 Sonnet** / GPT-4o / Gemini 1.5 Pro 対応
- プロジェクト要件を考慮した自動シフト最適化
- メンバー負担の均等化
- 最適化提案の可視化と承認フロー

### 🎯 ミーティング管理
- プロジェクト別ミーティング作成
- 参加者管理（pending / accepted / declined / tentative）
- 定期ミーティング対応（recurrence rule）
- 参加ステータスの柔軟な更新

### 📆 Google統合
- **Google Calendar API** によるカレンダー自動同期
- **Google Meet** リンク自動生成
- シフト・ミーティングのリアルタイム反映
- カレンダーイベントの双方向同期

---

## 🛠 技術スタック

| カテゴリ | 技術 | バージョン |
|---------|------|-----------|
| **フレームワーク** | FastAPI | 0.115.0 |
| **言語** | Python | 3.11+ |
| **データベース** | PostgreSQL | 15+ |
| **キャッシュ** | Redis | 7+ |
| **ORM** | SQLAlchemy | 2.0 |
| **マイグレーション** | Alembic | 1.13 |
| **AI** | Anthropic Claude / OpenAI / Google Gemini | Latest |
| **認証** | Google OAuth 2.0, python-jose | - |
| **API ドキュメント** | OpenAPI 3.0 (Swagger/ReDoc) | Auto-generated |
| **コンテナ** | Docker Compose | - |

---

## 📋 前提条件

開発環境に以下がインストールされている必要があります：

- **Python** 3.11 以上
  ```bash
  python3 --version
  ```

- **Docker Desktop** （PostgreSQL + Redis用）
  ```bash
  docker --version
  docker-compose --version
  ```

- **Git**
  ```bash
  git --version
  ```

- **Google Cloud プロジェクト**
  - OAuth 2.0 クライアントID（作成済み）
  - Google Calendar API 有効化

- **AI API キー**（いずれか1つ）
  - Anthropic Claude API キー
  - OpenAI API キー
  - Google Gemini API キー

---

## 🚀 クイックスタート

最速で起動する方法：

```bash
# 1. backend ディレクトリに移動
cd /Users/naoyakusunoki/Desktop/dev/aimeet/backend

# 2. 起動スクリプトを実行（自動で環境構築・DB起動・サーバー起動）
./start.sh
```

起動スクリプトは以下を自動実行します：
- ✅ `.env` ファイルの確認
- ✅ Python仮想環境の作成
- ✅ 依存関係のインストール
- ✅ Docker（PostgreSQL + Redis）の起動
- ✅ データベースマイグレーション
- ✅ FastAPIサーバー起動

**起動後のアクセス先：**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Health Check: http://localhost:8000/health

---

## 📝 詳細セットアップ

手動でセットアップする場合の詳細手順：

### 1. リポジトリのクローン（既に完了している場合はスキップ）

```bash
cd /Users/naoyakusunoki/Desktop/dev/aimeet
```

### 2. 環境変数の設定

```bash
cd backend

# .env ファイルは既に作成済み（既存のAIMeetプロジェクトから値を取得済み）
# 内容を確認：
cat .env
```

環境変数の詳細は [環境変数セクション](#環境変数) を参照。

### 3. Docker Compose でデータベース起動

```bash
# PostgreSQL + Redis をバックグラウンドで起動
docker-compose up -d

# 起動確認
docker-compose ps

# 期待される出力:
# NAME                IMAGE               STATUS
# sifut_postgres      postgres:15-alpine  Up
# sifut_redis         redis:7-alpine      Up
```

### 4. Python 仮想環境のセットアップ

```bash
# 仮想環境作成
python3 -m venv venv

# 仮想環境を有効化
source venv/bin/activate  # macOS/Linux
# または
venv\Scripts\activate     # Windows

# 依存関係インストール
pip install --upgrade pip
pip install -r requirements.txt
```

### 5. データベースマイグレーション

```bash
# マイグレーションファイルの自動生成（初回のみ）
alembic revision --autogenerate -m "Initial migration"

# マイグレーション適用
alembic upgrade head

# 成功すると以下のメッセージが表示されます：
# INFO  [alembic.runtime.migration] Running upgrade  -> xxxxx, Initial migration
```

### 6. サーバー起動

```bash
# 開発モード（ホットリロード有効）
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# 本番モード（ワーカー4つ）
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

## 🔧 環境変数

`.env` ファイルに設定する環境変数の詳細：

### 必須の環境変数

| 変数名 | 説明 | 取得方法 | 設定値の例 |
|-------|------|---------|----------|
| `SECRET_KEY` | JWT署名用シークレット | `openssl rand -base64 32` で生成 | `7I+W50I/zA...` |
| `GOOGLE_CLIENT_ID` | Google OAuth クライアントID | [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | `375838597524-...apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth シークレット | Google Cloud Console | `GOCSPX-...` |
| `ANTHROPIC_API_KEY` | Claude API キー | [Anthropic Console](https://console.anthropic.com/) | `sk-ant-api03-...` |

### オプションの環境変数

| 変数名 | 説明 | デフォルト値 |
|-------|------|------------|
| `AI_PROVIDER` | 使用するAIプロバイダー | `claude` |
| `OPENAI_API_KEY` | OpenAI API キー（予備） | - |
| `GEMINI_API_KEY` | Gemini API キー（予備） | - |
| `DATABASE_URL` | PostgreSQL接続URL | `postgresql://sifut_user:sifut_password_dev@localhost:5432/sifut` |
| `REDIS_URL` | Redis接続URL | `redis://localhost:6379/0` |
| `CORS_ORIGINS` | CORS許可オリジン | `http://localhost:3000,...` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | アクセストークン有効期限（分） | `30` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | リフレッシュトークン有効期限（日） | `7` |

### Google OAuth 設定手順

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセス
2. プロジェクトを選択（または新規作成）
3. 「APIとサービス」→「認証情報」に移動
4. 「認証情報を作成」→「OAuth 2.0 クライアントID」を選択
5. アプリケーションの種類：「ウェブアプリケーション」
6. 承認済みのリダイレクト URI に以下を追加：
   - `http://localhost:3000/oauth2callback`
   - `http://localhost:3001/oauth2callback`（開発用）
7. クライアントIDとシークレットをコピーして `.env` に設定
8. 「APIとサービス」→「ライブラリ」から以下を有効化：
   - Google Calendar API
   - Google Meet API

---

## 📡 API エンドポイント

### 🔐 認証 (`/api/v1/auth`)

| メソッド | エンドポイント | 説明 | 認証 |
|---------|---------------|------|------|
| `POST` | `/auth/google` | Google OAuth認証 | 不要 |
| `GET` | `/auth/me` | 現在のユーザー情報取得 | 必要 |

**リクエスト例：**
```bash
# Google OAuth認証
curl -X POST "http://localhost:8000/api/v1/auth/google" \
  -H "Content-Type: application/json" \
  -d '{"code": "4/0AbCdEf...", "redirect_uri": "http://localhost:3000/oauth2callback"}'

# レスポンス
{
  "user": {
    "id": "uuid-...",
    "email": "user@example.com",
    "name": "山田太郎",
    "role": "member"
  },
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

### 📅 シフト管理 (`/api/v1/shifts`)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| `POST` | `/shifts/requests` | シフト希望作成 | member |
| `GET` | `/shifts/requests` | シフト希望一覧 | member |
| `GET` | `/shifts/requests/{id}` | シフト希望詳細 | member |
| `PATCH` | `/shifts/requests/{id}` | シフト希望更新 | member |
| `POST` | `/shifts/requests/{id}/submit` | シフト希望提出 | member |
| `DELETE` | `/shifts/requests/{id}` | シフト希望削除 | member |
| `POST` | `/shifts/confirmed` | 確定シフト作成 | admin |
| `GET` | `/shifts/confirmed` | 確定シフト一覧 | member |
| `DELETE` | `/shifts/confirmed/{id}` | 確定シフト削除 | admin |

### 🤖 LLM最適化 (`/api/v1/optimization`)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| `POST` | `/optimization/shifts` | シフト最適化実行 | admin |
| `GET` | `/optimization/suggestions` | 最適化提案一覧 | member |
| `POST` | `/optimization/suggestions/{id}/approve` | 提案承認 | admin |

**最適化リクエスト例：**
```bash
curl -X POST "http://localhost:8000/api/v1/optimization/shifts" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"month": "2025-12"}'
```

### 🎯 ミーティング (`/api/v1/meetings`)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| `POST` | `/meetings` | ミーティング作成 | member |
| `GET` | `/meetings` | ミーティング一覧 | member |
| `GET` | `/meetings/{id}` | ミーティング詳細 | member |
| `GET` | `/meetings/{id}/participants` | 参加者一覧 | member |
| `PATCH` | `/meetings/{id}/participants/{user_id}/status` | 参加ステータス更新 | member |
| `DELETE` | `/meetings/{id}` | ミーティング削除 | creator |

### 📆 Google Calendar (`/api/v1/calendar`)

| メソッド | エンドポイント | 説明 | 権限 |
|---------|---------------|------|------|
| `POST` | `/calendar/sync/shift` | シフト同期 | member |
| `POST` | `/calendar/sync/meeting` | ミーティング同期（Meet生成） | creator |
| `DELETE` | `/calendar/sync/shift/{id}` | シフト削除 | member |

---

## 🌐 フロントエンド統合

Next.js フロントエンドとの統合方法：

### 1. API クライアント設定

**`frontend/lib/api.ts`** を作成：

```typescript
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// JWT トークンをリクエストヘッダーに追加
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// トークンリフレッシュ処理
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // トークンリフレッシュ処理
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        // リフレッシュ処理を実装
      }
    }
    return Promise.reject(error);
  }
);
```

### 2. 認証フロー実装

**`frontend/app/auth/callback/page.tsx`**:

```typescript
'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code = searchParams.get('code');

    if (code) {
      handleGoogleCallback(code);
    }
  }, [searchParams]);

  const handleGoogleCallback = async (code: string) => {
    try {
      const response = await apiClient.post('/api/v1/auth/google', {
        code,
        redirect_uri: 'http://localhost:3000/auth/callback',
      });

      const { access_token, refresh_token, user } = response.data;

      // トークンを保存
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      localStorage.setItem('user', JSON.stringify(user));

      // ダッシュボードにリダイレクト
      router.push('/dashboard');
    } catch (error) {
      console.error('Authentication failed:', error);
      router.push('/login?error=auth_failed');
    }
  };

  return <div>認証中...</div>;
}
```

### 3. シフト管理 API 呼び出し例

```typescript
// シフト希望の作成
export const createShiftRequest = async (data: {
  date: string;
  start_time: string;
  end_time: string;
  comment?: string;
}) => {
  const response = await apiClient.post('/api/v1/shifts/requests', data);
  return response.data;
};

// シフト希望一覧取得
export const getShiftRequests = async (params?: {
  start_date?: string;
  end_date?: string;
  status?: string;
}) => {
  const response = await apiClient.get('/api/v1/shifts/requests', { params });
  return response.data;
};

// シフト最適化実行（管理者のみ）
export const optimizeShifts = async (month: string) => {
  const response = await apiClient.post('/api/v1/optimization/shifts', { month });
  return response.data;
};
```

### 4. 環境変数設定

**`frontend/.env.local`**:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_GOOGLE_CLIENT_ID=375838597524-e16ks0s8eako6toctscc7s0hsno8nh8n.apps.googleusercontent.com
```

---

## 🗄️ データベース構造

12個のテーブルで構成：

```
┌─────────────────┐
│     users       │  ← ユーザー情報（Google OAuth）
└────────┬────────┘
         │
         ├──→ shift_requests      （シフト希望）
         ├──→ confirmed_shifts    （確定シフト）
         ├──→ meetings            （ミーティング）
         ├──→ templates           （テンプレート）
         └──→ notifications       （通知）

┌─────────────────┐
│    projects     │  ← プロジェクト
└────────┬────────┘
         │
         ├──→ project_members     （メンバー）
         ├──→ confirmed_shifts    （確定シフト）
         └──→ meetings            （ミーティング）

┌──────────────────────────┐
│ optimization_suggestions │  ← LLM最適化提案
└────────┬─────────────────┘
         │
         └──→ optimization_assignments
```

詳細なER図とテーブル定義は [`/docs/database-design.md`](../docs/database-design.md) を参照。

---

## 📂 プロジェクト構成

```
backend/
├── README.md                    # このファイル
├── .env                         # 環境変数（Git管理外）
├── .env.example                 # 環境変数テンプレート
├── docker-compose.yml           # PostgreSQL + Redis
├── requirements.txt             # Python依存関係
├── start.sh                     # 起動スクリプト
├── alembic.ini                  # Alembic設定
├── alembic/
│   ├── env.py                   # マイグレーション環境
│   ├── script.py.mako           # マイグレーションテンプレート
│   └── versions/                # マイグレーションファイル
└── app/
    ├── __init__.py
    ├── main.py                  # FastAPIアプリケーション
    ├── core/
    │   ├── config.py            # 設定管理
    │   └── security.py          # JWT認証
    ├── db/
    │   └── database.py          # DB接続
    ├── models/                  # SQLAlchemyモデル
    │   ├── user.py
    │   ├── project.py
    │   ├── shift.py
    │   ├── meeting.py
    │   ├── optimization.py
    │   ├── template.py
    │   └── notification.py
    ├── schemas/                 # Pydanticスキーマ
    │   ├── auth.py
    │   ├── shift.py
    │   └── meeting.py
    ├── services/                # ビジネスロジック
    │   ├── google_oauth.py
    │   ├── google_calendar.py
    │   └── llm_service.py
    └── api/
        ├── deps/
        │   └── auth.py          # 認証依存関係
        └── endpoints/
            ├── auth.py
            ├── shifts.py
            ├── meetings.py
            ├── optimization.py
            └── calendar.py
```

---

## 🔄 開発ワークフロー

### 新機能の追加手順

1. **ブランチ作成**
   ```bash
   git checkout -b feature/new-feature
   ```

2. **モデル作成** (`app/models/`)
   ```python
   # app/models/new_model.py
   from sqlalchemy import Column, String
   from app.db.database import Base

   class NewModel(Base):
       __tablename__ = "new_table"
       id = Column(String(36), primary_key=True)
       # ...
   ```

3. **マイグレーション生成・適用**
   ```bash
   alembic revision --autogenerate -m "Add new_table"
   alembic upgrade head
   ```

4. **スキーマ定義** (`app/schemas/`)
   ```python
   # app/schemas/new_model.py
   from pydantic import BaseModel

   class NewModelCreate(BaseModel):
       # ...
   ```

5. **エンドポイント実装** (`app/api/endpoints/`)
   ```python
   # app/api/endpoints/new_endpoint.py
   from fastapi import APIRouter

   router = APIRouter()

   @router.post("")
   async def create():
       # ...
   ```

6. **ルーター登録** (`app/main.py`)
   ```python
   from app.api.endpoints import new_endpoint

   app.include_router(
       new_endpoint.router,
       prefix="/api/v1/new",
       tags=["new"]
   )
   ```

7. **テスト作成** (`tests/`)
   ```python
   def test_create_new_model():
       # ...
   ```

8. **コミット・プッシュ**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/new-feature
   ```

### 開発コマンド

```bash
# 開発サーバー起動（ホットリロード）
uvicorn app.main:app --reload

# マイグレーション作成
alembic revision --autogenerate -m "message"

# マイグレーション適用
alembic upgrade head

# マイグレーションロールバック
alembic downgrade -1

# マイグレーション履歴確認
alembic history

# 現在のマイグレーション状態確認
alembic current

# テスト実行
pytest

# カバレッジ付きテスト
pytest --cov=app tests/

# コードフォーマット
black app/

# Linting
flake8 app/

# 型チェック
mypy app/
```

---

## 🚢 デプロイメント

### Railway でのデプロイ

1. **Railway アカウント作成**
   https://railway.app にアクセス

2. **PostgreSQL プラグイン追加**
   - 新規プロジェクト作成
   - "Add Plugin" → "PostgreSQL"
   - 接続URLを `.env` にコピー

3. **Redis プラグイン追加**
   - "Add Plugin" → "Redis"
   - 接続URLを `.env` にコピー

4. **アプリケーションデプロイ**
   ```bash
   # Railway CLI インストール
   npm i -g @railway/cli

   # ログイン
   railway login

   # プロジェクトリンク
   railway link

   # デプロイ
   railway up
   ```

5. **環境変数設定**
   - Railway ダッシュボードで環境変数を設定
   - `SECRET_KEY`, `GOOGLE_CLIENT_ID`, `ANTHROPIC_API_KEY` など

### Render でのデプロイ

1. **Render アカウント作成**
   https://render.com にアクセス

2. **PostgreSQL インスタンス作成**
   - "New" → "PostgreSQL"
   - 接続URLを取得

3. **Web Service 作成**
   - "New" → "Web Service"
   - GitHub リポジトリを接続
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

4. **環境変数設定**
   - ダッシュボードで環境変数を追加

### Docker でのデプロイ

**Dockerfile** を作成：

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# 依存関係インストール
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# アプリケーションコピー
COPY ./app ./app
COPY ./alembic ./alembic
COPY ./alembic.ini .

# マイグレーション実行とサーバー起動
CMD alembic upgrade head && \
    uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**ビルド・実行**：

```bash
# イメージビルド
docker build -t sifut-backend .

# コンテナ実行
docker run -d \
  -p 8000:8000 \
  --env-file .env \
  sifut-backend
```

---

## 🔧 トラブルシューティング

### ❌ データベース接続エラー

**エラー:** `sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) connection refused`

**解決策:**

```bash
# PostgreSQLが起動しているか確認
docker-compose ps

# 停止している場合は起動
docker-compose up -d

# ログ確認
docker-compose logs postgres

# コンテナ再作成
docker-compose down -v
docker-compose up -d
```

### ❌ マイグレーションエラー

**エラー:** `alembic.util.exc.CommandError: Can't locate revision identified by 'xxxxx'`

**解決策:**

```bash
# マイグレーション履歴を確認
alembic history

# データベースをリセット
docker-compose down -v
docker-compose up -d

# マイグレーション再実行
alembic upgrade head
```

### ❌ Google OAuth エラー

**エラー:** `invalid_client` または `redirect_uri_mismatch`

**解決策:**

1. [Google Cloud Console](https://console.cloud.google.com/apis/credentials) にアクセス
2. OAuth 2.0 クライアントIDを確認
3. 承認済みのリダイレクト URI を確認：
   - `http://localhost:3000/oauth2callback` が登録されているか
   - スペルミスがないか
4. `.env` の `GOOGLE_CLIENT_ID` と `GOOGLE_CLIENT_SECRET` が正しいか確認
5. Google Calendar API が有効化されているか確認

### ❌ LLM API エラー

**エラー:** `anthropic.APIError: 401 Unauthorized`

**解決策:**

```bash
# API キーを確認
echo $ANTHROPIC_API_KEY

# .env ファイルを確認
cat .env | grep ANTHROPIC_API_KEY

# API キーが正しいか Anthropic Console で確認
# https://console.anthropic.com/

# AI_PROVIDER が正しく設定されているか確認
cat .env | grep AI_PROVIDER
```

### ❌ ポート競合エラー

**エラー:** `Address already in use`

**解決策:**

```bash
# ポート8000を使用しているプロセスを確認
lsof -i :8000

# プロセスを終了
kill -9 <PID>

# または別のポートで起動
uvicorn app.main:app --reload --port 8001
```

### ❌ Python パッケージインストールエラー

**エラー:** `error: legacy-install-failure`

**解決策:**

```bash
# pip を最新版にアップグレード
pip install --upgrade pip

# パッケージを個別にインストール
pip install fastapi
pip install sqlalchemy
# ...

# または requirements.txt を分割してインストール
pip install -r requirements.txt --no-cache-dir
```

### 🔍 ログの確認

```bash
# Docker ログ確認
docker-compose logs -f postgres
docker-compose logs -f redis

# アプリケーションログ
# uvicorn 起動時にコンソールに出力されます

# Alembic ログ
# マイグレーション実行時にコンソールに出力されます
```

---

## 📚 参考資料

- **FastAPI 公式ドキュメント**: https://fastapi.tiangolo.com/
- **SQLAlchemy ドキュメント**: https://docs.sqlalchemy.org/
- **Alembic ドキュメント**: https://alembic.sqlalchemy.org/
- **Google OAuth 2.0**: https://developers.google.com/identity/protocols/oauth2
- **Google Calendar API**: https://developers.google.com/calendar/api
- **Anthropic Claude API**: https://docs.anthropic.com/

---

## 📄 ライセンス

MIT License

---

## 🤝 コントリビューション

プルリクエスト歓迎！バグ報告や機能提案は [Issues](https://github.com/your-repo/issues) へ。

---

<div align="center">

**Made with ❤️ for NPO Organizations**

</div>
