# Slack自動共有機能ガイド

## 概要

AIMeetは会議終了後、自動的にSlackに議事録を投稿する機能を提供します。

### 主な機能

- ✅ **プロジェクト別チャンネル振り分け**: 国際交流/プログラミング/アート各プロジェクト専用チャンネルに自動投稿
- ✅ **担当者メンション**: アクションアイテムの担当者に自動メンション
- ✅ **リッチフォーマット**: Slack Block Kitで見やすく整形
- ✅ **重要情報の強調**: 高優先度タスクや未解決事項を目立たせる

---

## セットアップ

### 1. Slack Incoming Webhookの作成

1. [Slack API](https://api.slack.com/apps) にアクセス
2. 「Create New App」→「From scratch」
3. アプリ名と対象ワークスペースを選択
4. 「Incoming Webhooks」を有効化
5. 「Add New Webhook to Workspace」で投稿先チャンネルを選択
6. Webhook URLをコピー

### 2. 環境変数の設定

`.env` ファイルに以下を追加：

```bash
# Slack Webhook URL（必須）
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX

# プロジェクト別チャンネル（オプション）
SLACK_DEFAULT_CHANNEL=general
SLACK_INTERNATIONAL_CHANNEL=international-team
SLACK_PROGRAMMING_CHANNEL=programming-class
SLACK_ART_CHANNEL=art-support

# メンバーメンション設定（オプション）
SLACK_MEMBER_MAPPING={"かおや": "U0123456789", "Network Coral": "U9876543210"}
```

### 3. Slack User IDの取得方法

メンションを使用するには、各メンバーのSlack User IDが必要です：

1. Slackでユーザーのプロフィールを開く
2. 「その他」（三点リーダー）をクリック
3. 「メンバーIDをコピー」を選択
4. コピーしたID（例: `U0123456789`）を環境変数に設定

---

## 使い方

### 基本的な使い方

会議を処理すると、自動的にSlackに投稿されます：

```bash
# デフォルトチャンネルに投稿
./finish

# または
npm run process-meeting -- --bot <bot-id>
```

### プロジェクト指定

特定のプロジェクトチャンネルに投稿：

```bash
# 国際交流チャンネルに投稿
npm run process-meeting -- --bot <bot-id> --project international

# プログラミング教室チャンネルに投稿
npm run process-meeting -- --bot <bot-id> --project programming

# アート支援チャンネルに投稿
npm run process-meeting -- --bot <bot-id> --project art
```

---

## Slack投稿フォーマット

### ヘッダー部分

```
🌍 国際交流 - Recall.ai Recorded Meeting
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[📝 議事録を見る]  [🎥 Meet録画]
```

### 内容セクション

**📝 概要**
会議の概要が表示されます

**💡 重要なポイント**
- ポイント1
- ポイント2

**✅ 決定事項**
- 決定1
- 決定2

**🎯 アクションアイテム**
🔴 タスク1 (@かおや) *[期限: 2024-01-15]*
🟡 タスク2 (@Network Coral) *[期限: 2024-01-20]*

🔴 重要タスク担当: @かおや, @Network Coral

**⚠️ 未解決事項**
🔴 未解決の問題1
🟡 未解決の問題2

**🤖 AI提案**
- 提案1
- 提案2

**フッター**
👥 参加者: かおや, Network Coral
━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🤖 AI生成 | 2025年1月14日 15:30 | チャンネル: #international-team

---

## 高度な設定

### 複数チャンネルへの投稿

同じ議事録を複数のチャンネルに投稿したい場合は、Webhookを複数作成：

```bash
# メインチャンネル
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/XXX

# 通知用チャンネル（別途実装が必要）
SLACK_NOTIFICATION_WEBHOOK=https://hooks.slack.com/services/YYY
```

### カスタムフォーマット

`src/services/slack.ts` の `formatMinutesMessage` メソッドを編集することで、投稿フォーマットをカスタマイズできます。

---

## トラブルシューティング

### ❌ Slackに投稿されない

**原因1**: Webhook URLが正しくない

```bash
# Webhook URLを確認
echo $SLACK_WEBHOOK_URL
```

**原因2**: ネットワークエラー

```bash
# 手動でWebhookをテスト
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"Test message"}' \
  $SLACK_WEBHOOK_URL
```

---

### ❌ メンションが機能しない

**原因**: User IDが正しくない、またはJSON形式が不正

```bash
# JSON形式を確認
echo $SLACK_MEMBER_MAPPING

# 正しい形式の例
SLACK_MEMBER_MAPPING='{"山田太郎": "U0123ABCD", "佐藤花子": "U0456EFGH"}'
```

**注意**:
- ダブルクォートを使用
- カンマで区切る
- エスケープに注意

---

### ❌ 間違ったチャンネルに投稿される

**原因**: チャンネル設定が正しくない、またはWebhookの投稿先チャンネルが異なる

**解決方法**:
1. 環境変数のチャンネル名を確認
2. Slack Appの設定で、Webhookの投稿先チャンネルを確認
3. チャンネル名は `#` なしで指定（例: `general` not `#general`）

---

## Slack Block Kit Reference

AIMeetは以下のSlack Block Kitコンポーネントを使用しています：

- `header`: プロジェクト名とタイトル
- `section`: 各セクションの内容
- `divider`: セクション区切り
- `actions`: ボタン（Notion/Meet録画リンク）
- `context`: メタ情報（参加者、日時など）

カスタマイズの参考: [Slack Block Kit Builder](https://app.slack.com/block-kit-builder)

---

## 実装例

### 例1: 基本的な使用

```bash
# 1. 会議記録
./bot https://meet.google.com/xxx-xxxx-xxx

# 2. 会議終了後、議事録生成＆Slack投稿
./finish
```

**結果**: デフォルトチャンネルに議事録が投稿される

---

### 例2: プロジェクト別投稿

```bash
# プログラミング教室の会議
npm run process-meeting -- --bot <bot-id> --project programming
```

**結果**: `#programming-class` チャンネルに投稿される

---

### 例3: メンション付き

環境変数で設定：
```bash
SLACK_MEMBER_MAPPING='{"講師A": "U0123ABC", "講師B": "U0456DEF"}'
```

会議でアクションアイテムに「講師A」が担当として記載されていると、Slackで自動的に `@講師A` とメンションされる。

---

## FAQ

### Q: 特定のチャンネルにのみ投稿したくない場合は？

A: 環境変数 `SLACK_WEBHOOK_URL` を削除すれば、Slack投稿機能は無効化されます。

---

### Q: メンションなしで名前だけ表示できますか？

A: `SLACK_MEMBER_MAPPING` を設定しなければ、メンションなしで名前がそのまま表示されます。

---

### Q: 投稿内容をもっと短くしたい

A: `src/services/slack.ts` を編集して、不要なセクションをコメントアウトしてください。例：

```typescript
// AI Suggestions (top 2) - この部分をコメントアウト
/*
if (minutes.aiSuggestions && minutes.aiSuggestions.length > 0) {
  ...
}
*/
```

---

### Q: 別のSlackワークスペースに投稿できますか？

A: はい。別のワークスペースでIncoming Webhookを作成し、そのURLを環境変数に設定してください。

---

## 次のステップ

- [マルチプロジェクト設定](multi-project-setup.md) - プロジェクト別データベース管理
- [将来構想ロードマップ](future-roadmap.md) - Phase 6のSlack高度連携機能
- [README](../README.md) - トップページに戻る

---

**💡 Tips**:
- 議事録が長い場合、Slackの投稿は要約版が表示され、詳細はNotionリンクから確認できます
- 重要なタスクの担当者には自動的にメンションされるため、見逃しを防げます
- プロジェクト別チャンネルを使うことで、関係者のみに通知が届きます
