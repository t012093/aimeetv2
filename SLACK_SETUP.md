# 🎉 Slack複数チャンネル設定ガイド

## ✅ 取得済みのWebhook URL

以下の3つのプロジェクト用のWebhook URLを用意してください：

### 1. 🎨 p-art チャンネル用
### 2. 🌍 p-国際交流 チャンネル用
### 3. 💻 p-子供プログラミング教室 チャンネル用

各Webhook URLは、Slack Appの「Incoming Webhooks」ページで取得できます。

---

## 📝 .envファイルへの設定方法

`.env` ファイルに以下を追加してください：

```bash
# ============================================
# Slack 設定
# ============================================
# デフォルトWebhook URL（どれか1つを設定）
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# プロジェクト別Webhook URL
SLACK_WEBHOOK_URL_INTERNATIONAL=https://hooks.slack.com/services/YOUR/INTERNATIONAL/WEBHOOK
SLACK_WEBHOOK_URL_PROGRAMMING=https://hooks.slack.com/services/YOUR/PROGRAMMING/WEBHOOK
SLACK_WEBHOOK_URL_ART=https://hooks.slack.com/services/YOUR/ART/WEBHOOK

# チャンネル名（表示用）
SLACK_DEFAULT_CHANNEL=general
SLACK_INTERNATIONAL_CHANNEL=p-国際交流
SLACK_PROGRAMMING_CHANNEL=p-子供プログラミング教室
SLACK_ART_CHANNEL=p-art

# メンバーメンション（オプション）
# User IDを取得して設定してください
SLACK_MEMBER_MAPPING={}
```

---

## 🚀 使い方

### 自動チャンネル振り分け

プロジェクトを指定すると、自動的に該当するチャンネルに投稿されます：

```bash
# 🎨 アート支援 → #p-art
npm run process-meeting -- --bot <bot-id> --project art

# 🌍 国際交流 → #p-国際交流
npm run process-meeting -- --bot <bot-id> --project international

# 💻 プログラミング教室 → #p-子供プログラミング教室
npm run process-meeting -- --bot <bot-id> --project programming

# デフォルト → SLACK_WEBHOOK_URL で設定したチャンネル
./finish
```

---

## ✅ テスト

設定が完了したら、環境変数を使ってテストできます：

```bash
# テスト投稿（環境変数から自動的にWebhook URLを使用）
curl -X POST -H 'Content-type: application/json' \
  --data '{"text":"🎉 Slack連携テスト成功！"}' \
  $SLACK_WEBHOOK_URL
```

各チャンネルにメッセージが表示されればOK！

---

## 🎯 実際の会議で試す

### ステップ1: 会議を記録

```bash
# 例: プログラミング教室の講師ミーティング
./bot https://meet.google.com/your-meeting-url
```

### ステップ2: 議事録生成＆Slack投稿

```bash
# プログラミング教室のチャンネルに投稿
npm run process-meeting -- --bot <bot-id> --project programming
```

### 結果

`#p-子供プログラミング教室` チャンネルに以下のような議事録が投稿されます：

```
💻 プログラミング教室 - 講師ミーティング
━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[📝 議事録を見る]  [🎥 Meet録画]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 概要
次回のイベント準備について話し合いました...

🎯 アクションアイテム
🔴 教材準備 (@講師A) [期限: 2024-01-20]
🟡 会場予約 (@講師B)

...
```

---

## 💡 Tips

### メンバーメンションを設定する

Slackで各メンバーのUser IDを取得：

1. Slackでメンバーのプロフィールを開く
2. 「その他」（⋮）→「メンバーIDをコピー」
3. コピーしたIDを`.env`に追加：

```bash
SLACK_MEMBER_MAPPING={"講師A": "U0123456789", "講師B": "U0456ABCD"}
```

これで、アクションアイテムの担当者に自動的に `@講師A` とメンションされます！

---

## 🔧 トラブルシューティング

### 問題: 投稿されない

**確認事項**:
1. `.env`ファイルのWebhook URLが正しいか
2. プロジェクトタイプのスペルが正しいか（`art`, `international`, `programming`）
3. ビルドし直したか（`npm run build`）

### 問題: 間違ったチャンネルに投稿される

**確認事項**:
1. `--project` オプションを正しく指定しているか
2. 環境変数の `SLACK_WEBHOOK_URL_*` が正しく設定されているか

---

## 📚 次のステップ

- [Slack Integration Guide](docs/slack-integration.md) - 詳細な設定ガイド
- [Multi-Project Setup](docs/multi-project-setup.md) - プロジェクト管理ガイド

---

**🎉 設定完了！各プロジェクトの議事録が自動的に適切なチャンネルに投稿されるようになりました！**
