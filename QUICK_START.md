# 🚀 AIMeet クイックスタート

## 2ステップで議事録生成（推奨）

### ステップ1: 録画開始
```bash
./bot https://meet.google.com/xxx-xxxx-xxx
```

**出力例:**
```
🤖 AIMeet - Send Bot to Meeting

📍 Meeting URL: https://meet.google.com/xxx-xxxx-xxx

⏳ Creating bot...

✅ Bot created successfully!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Bot Information
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Bot ID: 1cae48d7-c234-4a55-ad74-060a9b1e6ab7
   Status: joining_call

📝 Next Steps:
   1. Join the meeting
   2. Approve "AIMeet Recorder" bot
   3. Conduct your meeting
   4. After meeting ends, process the recording

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 Bot ID saved! After meeting, simply run: ./finish
```

### ステップ2: 議事録生成（会議終了後）
```bash
./finish
```

**これだけで自動的に：**
- ✅ トランスクリプト取得
- ✅ AI議事録生成
- ✅ 次回アジェンダ生成
- ✅ ファイル保存（Record/とAgenda/）

---

## 自動モード（会議終了まで待機）

会議が終わるまでプロセスが動き続けますが、完全自動です：

```bash
./auto-record https://meet.google.com/xxx-xxxx-xxx
```

---

## ファイルが保存される場所

```
aimeet/
├── Record/                    ← 議事録
│   └── 2025/
│       └── 11/
│           └── meeting-2025-11-14-14-30-00.md
│
└── Agenda/                    ← 次回アジェンダ
    └── 2025/
        └── 11/
            └── agenda-2025-11-14-14-30-00.md
```

---

## ワークフロー比較

### 🔥 推奨: 2ステップモード
```bash
# 会議前
./bot <URL>           # → すぐに終了（Bot IDを保存）

# 会議後
./finish              # → 議事録・アジェンダ生成
```

**メリット:**
- すぐに他の作業ができる
- Bot IDを覚える必要なし（自動保存）

### ⏳ 自動モード
```bash
./auto-record <URL>   # → 会議終了まで待機 → 自動生成
```

**メリット:**
- 完全自動（1コマンド）

**デメリット:**
- プロセスが動き続ける

---

## トラブルシューティング

### Bot IDがわからない
```bash
# 最後のBotを使用
./finish

# または明示的に指定
./finish 1cae48d7-c234-4a55-ad74-060a9b1e6ab7
```

### 会議が長引いた場合
- Ctrl+Cで中断してもOK（S3に録画済み）
- 後で`./finish <bot-id>`で処理可能

### OpenAI APIエラー
クォータを確認: https://platform.openai.com/usage

---

## 生成される内容

### 📋 議事録 (Record/)
- 📝 概要
- 💡 重要ポイント
- ✅ 決定事項
- 🎯 アクションアイテム（表形式）
- ⚠️ 未解決事項
- 🤖 AIからの提案
- ⚡ リスク分析（表形式）
- 📅 タイムライン（Mermaidガントチャート）
- 🔄 アクションフロー（Mermaid図）

### 📅 アジェンダ (Agenda/)
- 🎯 会議の目的
- 👥 参加者リスト
- 📋 議題（時間配分付き）
- 📝 事前準備チェックリスト
- 📅 タイムテーブル（Mermaidガントチャート）

サンプル:
- [議事録サンプル](SAMPLE_OUTPUT.md)
- [アジェンダサンプル](SAMPLE_AGENDA.md)

---

## 料金

- **Recall.ai**: $0.15/時間
- **OpenAI GPT-4**: $0.02〜0.10/会議

---

## 次に読むドキュメント

- [完全な使い方ガイド](USAGE.md)
- [実装の詳細](COMPLETE.md)
