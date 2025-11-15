# AIMeet Frontend

AIMeetのWebフロントエンド - NPO運営を革新する、AI駆動の会議自動化システム

## 🚀 技術スタック

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

## 📦 セットアップ

### 前提条件

- Node.js 18以上
- npm または yarn

### インストール

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開きます。

## 🎨 実装済み画面

### 1. ダッシュボード (`/`)
- プロジェクト概要カード（5プロジェクトタイプ）
- 統計サマリー（会議数、録音時間、議事録数）
- 最近の会議リスト
- クイックアクションボタン

### 2. 会議記録開始画面 (`/record`)
- 3ステップのマルチステップフォーム
  - Step 1: 録音方法選択（カレンダー / URL / ファイル）
  - Step 2: プロジェクトタイプ選択（5種類）
  - Step 3: 確認画面
- リアルタイムプレビュー

### 3. 議事録一覧 (`/meetings`)
- プレースホルダー（実装予定）

### 4. 設定 (`/settings`)
- プレースホルダー（実装予定）

## 📁 ディレクトリ構成

```
frontend/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # ルートレイアウト
│   ├── page.tsx             # ダッシュボード
│   ├── globals.css          # グローバルスタイル
│   ├── record/
│   │   └── page.tsx         # 会議記録開始画面
│   ├── meetings/
│   │   └── page.tsx         # 議事録一覧
│   └── settings/
│       └── page.tsx         # 設定
├── components/
│   ├── ui/                  # shadcn/ui コンポーネント
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── badge.tsx
│   └── navigation.tsx       # ナビゲーションバー
├── lib/
│   ├── utils.ts             # ユーティリティ関数
│   └── mock-data.ts         # モックデータ
├── public/                  # 静的ファイル
├── components.json          # shadcn/ui設定
├── tailwind.config.ts       # Tailwind設定
├── tsconfig.json            # TypeScript設定
└── package.json
```

## 🎯 主要機能

### プロジェクトタイプ

5種類のプロジェクトをサポート：

| アイコン | プロジェクト | 説明 |
|---------|------------|------|
| 🌍 | 国際交流 | 国際交流・異文化理解プログラム |
| 💻 | プログラミング教室 | 子供向けプログラミング教室 |
| 🎨 | アート支援 | アート・文化支援活動 |
| 💼 | 面接 | 採用・面接プロセス |
| 📋 | デフォルト | 一般的な会議 |

### レスポンシブデザイン

- **デスクトップ**: 1440px〜
- **タブレット**: 768px〜1439px
- **モバイル**: 〜767px

すべてのページがモバイルファーストで設計されています。

## 🧪 開発

### 利用可能なスクリプト

```bash
# 開発サーバー起動
npm run dev

# 本番ビルド
npm run build

# 本番サーバー起動
npm run start

# Lint実行
npm run lint
```

### コンポーネントの追加

shadcn/uiから新しいコンポーネントを追加する場合：

```bash
npx shadcn@latest add <component-name>
```

例：
```bash
npx shadcn@latest add dialog
npx shadcn@latest add select
npx shadcn@latest add input
```

## 🔗 バックエンド連携

現在はモックデータを使用していますが、将来的には以下の方法でバックエンドと連携予定：

### オプション1: REST API
```typescript
// app/api/meetings/route.ts
export async function GET() {
  const meetings = await fetchMeetings()
  return Response.json(meetings)
}
```

### オプション2: tRPC（推奨）
```typescript
// server/routers/meeting.ts
export const meetingRouter = router({
  list: publicProcedure.query(() => {
    return db.meetings.findMany()
  }),
})
```

### オプション3: Server Actions
```typescript
// app/actions/meeting.ts
'use server'
export async function createMeeting(data: MeetingData) {
  // ...
}
```

## 📝 カスタマイズ

### カラーテーマの変更

[app/globals.css](app/globals.css) の CSS変数を編集：

```css
:root {
  --primary: 221.2 83.2% 53.3%;  /* プライマリカラー */
  --secondary: 0 0% 96.1%;       /* セカンダリカラー */
  /* ... */
}
```

### プロジェクトタイプの追加

[lib/mock-data.ts](lib/mock-data.ts) に新しいプロジェクトを追加：

```typescript
export const projects: Project[] = [
  // ...
  {
    id: 'new-project',
    name: '新プロジェクト',
    icon: '🚀',
    color: 'bg-indigo-500',
    description: '新しいプロジェクトの説明',
    meetingsThisMonth: 0,
    incompleteTasks: 0,
  },
]
```

## 🚀 デプロイ

### Vercel（推奨）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

```bash
npm run build
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🛠️ トラブルシューティング

### ビルドエラー

```bash
# node_modulesとビルドキャッシュを削除
rm -rf node_modules .next
npm install
npm run build
```

### スタイルが適用されない

Tailwind CSSのキャッシュをクリア：

```bash
npx tailwindcss -i ./app/globals.css -o ./app/output.css --watch
```

## 📚 参考リンク

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)

## 📄 ライセンス

MIT License

---

Made with ❤️ by the AIMeet Team
