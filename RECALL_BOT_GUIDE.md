# Recall.ai Bot レコーディングガイド 🤖

## 🎯 概要

Recall.ai Botを使うと、AIボットが会議に参加して自動で録画・文字起こし・議事録生成を行います。

**メリット:**
- ✅ 完全自動録画
- ✅ 高品質な文字起こし
- ✅ 録音忘れなし
- ✅ どこからでも実行可能

---

## 🚀 使い方（3パターン）

### パターン1: 自動待機（推奨）

会議終了まで待機して、自動で議事録生成：

```bash
./record-bot.sh https://meet.google.com/xxx-xxxx-xxx
```

または

```bash
npm run process-meeting -- --meetUrl https://meet.google.com/xxx-xxxx-xxx --output minutes.txt
```

**タイムライン:**
1. ボット作成（5秒）
2. ボットが会議参加
3. ⏳ **CLIが待機**（会議終了まで）
4. 会議終了を検知
5. 自動で文字起こし取得
6. 自動でAI要約
7. ファイル保存

**所要時間:** 会議時間 + 処理時間（1-2分）

---

### パターン2: 2ステップ方式（柔軟）

ボットを送った後、CLIを終了して後から処理：

#### Step 1: ボットを送る

```bash
npm run send-bot https://meet.google.com/xxx-xxxx-xxx
```

出力例:
```
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
   4. After meeting ends, process the recording:

      npm run process-meeting -- --bot 1cae48d7-c234-4a55-ad74-060a9b1e6ab7 --output minutes.txt
```

**Bot IDをコピー保存！**

#### Step 2: 会議終了後、処理

```bash
npm run process-meeting -- --bot <bot-id> --output minutes.txt
```

**メリット:**
- ✅ CLIをブロックしない
- ✅ いつでも処理可能
- ✅ 複数会議を並行処理可能

---

### パターン3: インタラクティブ

```bash
npm run record
```

1. 「2」を選択（Meeting URL）
2. URLを貼り付け
3. 完了！

---

## 📋 詳細ワークフロー

### 会議開始前

```bash
# ボットを送る
./record-bot.sh https://meet.google.com/abc-defg-hij
```

または

```bash
npm run send-bot https://meet.google.com/abc-defg-hij
# → Bot ID をメモ: 1cae48d7-c234-4a55-ad74-060a9b1e6ab7
```

### 会議中

1. **Google Meetに参加**
   - ブラウザでMeet URLを開く

2. **ボットを承認**
   - 「AIMeet Recorder」が参加リクエスト
   - **「承認」または「許可」をクリック**

3. **会議進行**
   - 普通に会議を進める
   - ボットが自動で録画中

4. **会議終了**
   - 「退出」をクリック
   - ボットも自動退出

### 会議終了後

#### パターン1を使った場合
→ 自動で処理されます（何もしなくてOK）

#### パターン2を使った場合

```bash
npm run process-meeting -- --bot 1cae48d7-c234-4a55-ad74-060a9b1e6ab7 --output minutes.txt
```

**処理内容:**
1. 文字起こし取得
2. OpenAI GPT-4で要約
3. TODO抽出
4. 決定事項まとめ
5. ファイル保存

---

## 💰 コスト

Recall.ai料金: **$0.05/分**

| 会議時間 | コスト |
|---------|--------|
| 10分 | $0.50 |
| 30分 | $1.50 |
| 1時間 | $3.00 |
| 2時間 | $6.00 |

**OpenAI料金:**
- GPT-4要約: ~$0.01-0.10（会議の長さによる）

---

## 🎓 実践例

### 例1: 定例ミーティング（毎週）

```bash
# 毎週月曜10時の定例
./record-bot.sh https://meet.google.com/team-weekly-sync
```

**自動化（cron）:**
```bash
# crontab -e
# 毎週月曜 9:55に実行
55 9 * * 1 cd ~/Desktop/dev/aimeet && ./record-bot.sh https://meet.google.com/team-weekly-sync
```

### 例2: 複数会議を同時録画

```bash
# 会議A（10:00-11:00）
npm run send-bot https://meet.google.com/meeting-a
# → Bot ID A: abc123

# 会議B（10:30-11:30）
npm run send-bot https://meet.google.com/meeting-b
# → Bot ID B: def456

# 両方終了後
npm run process-meeting -- --bot abc123 --output meeting-a.txt
npm run process-meeting -- --bot def456 --output meeting-b.txt
```

### 例3: 長時間会議（2時間+）

```bash
# 2ステップ方式を推奨
npm run send-bot https://meet.google.com/long-meeting

# 会議終了後（数時間後でもOK）
npm run process-meeting -- --bot <bot-id> --output minutes.txt
```

---

## 🔧 トラブルシューティング

### ボットが承認されない

**症状:** ボットが待機室で待ち続ける

**解決:**
1. 自分が会議に参加しているか確認
2. 参加者一覧を確認
3. 「AIMeet Recorder」を探す
4. 手動で承認

### トランスクリプトが空

**症状:** 0 words

**原因:**
- 誰も話していない
- マイクがミュート
- Google Meetの音声設定問題

**解決:**
- 実際に話す
- マイクをON
- もう一度テスト

### CLIが終わらない（パターン1）

**症状:** 会議終了後もCLIが動いている

**解決:**
1. Ctrl+Cで中断
2. Bot IDを確認
3. パターン2で処理

```bash
# Bot IDを確認（ログから）
# 例: Bot created: 1cae48d7-c234-4a55-ad74-060a9b1e6ab7

npm run process-meeting -- --bot 1cae48d7-c234-4a55-ad74-060a9b1e6ab7 --output minutes.txt
```

### APIエラー

**症状:** Failed to create bot

**原因:**
- Recall.ai API Keyが無効
- クォータ超過
- リージョンが間違っている

**解決:**
```bash
# .envを確認
cat .env | grep RECALL

# 正しい設定
RECALL_API_KEY=your_key_here
RECALL_REGION=us-west-2
```

---

## 📊 ベストプラクティス

### 1. 会議前の準備

- [ ] Recall.ai APIクォータ確認
- [ ] OpenAI APIクォータ確認
- [ ] ネットワーク接続確認

### 2. 会議中

- [ ] ボットを承認
- [ ] 実際に話す（無音だとトランスクリプト空）
- [ ] 重要な決定は明確に発言

### 3. 会議後

- [ ] 議事録を確認
- [ ] 必要に応じて手動修正
- [ ] Notion/Slackに共有

---

## 🎯 まとめ

### 最も簡単な方法

```bash
./record-bot.sh https://meet.google.com/xxx-xxxx-xxx
```

### 最も柔軟な方法

```bash
# ボット送信
npm run send-bot https://meet.google.com/xxx-xxxx-xxx

# 後で処理
npm run process-meeting -- --bot <bot-id> --output minutes.txt
```

### エイリアス設定（推奨）

```bash
# ~/.zshrcに追加
alias send-bot='cd ~/Desktop/dev/aimeet && npm run send-bot'
alias process-bot='cd ~/Desktop/dev/aimeet && npm run process-meeting -- --bot'

# 使用
send-bot https://meet.google.com/xxx-xxxx-xxx
process-bot <bot-id> --output minutes.txt
```

---

**これでRecall.ai Botを使った完全自動録画が可能です！** 🎉
