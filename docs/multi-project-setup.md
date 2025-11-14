# マルチプロジェクト対応ガイド

AIMeetは複数のプロジェクトごとに異なるNotionデータベースに議事録を出力できます。

## 設定方法

### 1. .envファイルにプロジェクトデータベースを追加

```bash
# Notion Project Databases
NOTION_INTERNATIONAL_DATABASE_ID=1c5e773472ce80788fd0d1e3812ea0d4  # 国際交流プロジェクト
NOTION_PROGRAMMING_DATABASE_ID=1c9e773472ce80b5b647c21f23615840    # 子供プログラミング教室
NOTION_ART_DATABASE_ID=2aae773472ce804a9988c756d7d493aa            # アート支援プロジェクト
```

### 2. NotionデータベースIDの取得方法

1. Notionでデータベースを開く
2. URLをコピー
   - 例: `https://www.notion.so/1c5e773472ce80788fd0d1e3812ea0d4?v=...`
3. `?v=` の前の部分がデータベースID
   - この例では: `1c5e773472ce80788fd0d1e3812ea0d4`

## 使い方

### プロジェクトを指定して会議を処理

```bash
# 国際交流プロジェクト
npm run process-meeting -- --bot <bot-id> --project international

# 子供プログラミング教室
npm run process-meeting -- --bot <bot-id> --project programming

# アート支援プロジェクト
npm run process-meeting -- --bot <bot-id> --project art

# デフォルト（NOTION_MEETING_DATABASE_IDを使用）
npm run process-meeting -- --bot <bot-id>
# または
npm run process-meeting -- --bot <bot-id> --project default
```

### finishスクリプトでの使用

現在の`finish`スクリプトを拡張して、プロジェクトタイプを指定できるようにすることもできます：

```bash
# finishスクリプトの例（将来的な拡張）
./finish --project international
./finish --project programming
./finish --project art
```

## プロジェクトタイプ一覧

| プロジェクトタイプ | 説明 | 環境変数 |
|:------------------|:-----|:---------|
| `international` | 国際交流プロジェクト | `NOTION_INTERNATIONAL_DATABASE_ID` |
| `programming` | 子供プログラミング教室 | `NOTION_PROGRAMMING_DATABASE_ID` |
| `art` | アート支援プロジェクト | `NOTION_ART_DATABASE_ID` |
| `default` | デフォルトデータベース | `NOTION_MEETING_DATABASE_ID` |

## 新しいプロジェクトの追加

1. `.env`に新しいデータベースIDを追加
   ```bash
   NOTION_YOUR_PROJECT_DATABASE_ID=your-database-id-here
   ```

2. `src/services/notion.ts`のProjectTypeに追加
   ```typescript
   export type ProjectType = 'international' | 'programming' | 'art' | 'your-project' | 'default';
   ```

3. `getDatabaseIdForProject`関数に追加
   ```typescript
   const dbMap: Record<ProjectType, string | undefined> = {
     international: process.env.NOTION_INTERNATIONAL_DATABASE_ID,
     programming: process.env.NOTION_PROGRAMMING_DATABASE_ID,
     art: process.env.NOTION_ART_DATABASE_ID,
     'your-project': process.env.NOTION_YOUR_PROJECT_DATABASE_ID,
     default: process.env.NOTION_MEETING_DATABASE_ID,
   };
   ```

## 実行例

```bash
# 保存されたBot IDを使用して、プログラミング教室の会議を処理
./finish
# その後、次のように手動で指定することも可能
npm run process-meeting -- --bot 9f8194ac-56aa-41b1-b30a-c9f0a86dc4e7 --project programming

# 国際交流プロジェクトの会議
npm run process-meeting -- --bot <bot-id> --project international --template default

# アート支援プロジェクトの会議
npm run process-meeting -- --bot <bot-id> --project art
```

## トラブルシューティング

### エラー: "Missing database ID for project type"

- `.env`ファイルに該当するプロジェクトのデータベースIDが設定されているか確認
- 環境変数名が正しいか確認（例: `NOTION_PROGRAMMING_DATABASE_ID`）

### プロジェクトタイプが認識されない

- 指定したプロジェクトタイプが有効な値か確認
- 有効な値: `international`, `programming`, `art`, `default`
- 大文字小文字を確認（すべて小文字で指定）
