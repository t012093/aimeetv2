# Recall.ai Integration Guide

AIMeetは[Recall.ai](https://www.recall.ai/)と統合され、AIボットを会議に参加させて自動録画・文字起こしが可能になりました。

## 🎯 Recall.aiとは？

Recall.aiは、AIボットを任意のビデオ会議プラットフォーム（Google Meet、Zoom、Microsoft Teamsなど）に参加させ、自動で録画・文字起こしを行うAPIサービスです。

### メリット

- ✅ **完全自動** - ボットが会議に参加して自動録音
- ✅ **リアルタイム文字起こし** - 会議中にリアルタイムで字幕生成
- ✅ **Pro不要** - Google Workspace無料プランでも利用可能
- ✅ **高品質** - ビデオ + オーディオ + トランスクリプト
- ✅ **どの会議でも** - Google Meet, Zoom, Teams全対応
- ✅ **自分が参加不要** - ボットだけ送り込める

### デメリット

- ❌ **有料** - 約$0.05/分（Whisperより高い）
- ❌ **ボットが見える** - 参加者に「AIMeet Recorder」が表示される
- ❌ **承認が必要** - 誰かがボットを承認する必要がある

---

## セットアップ

### 1. Recall.aiアカウント作成

1. [Recall.ai](https://www.recall.ai/)にサインアップ
2. ダッシュボードでAPI Keyを取得
3. リージョンを確認（us-west-2, us-east-1, eu-central-1, ap-northeast-1）

### 2. 環境変数設定

`.env`ファイルに追加：

```bash
# Recall.ai - Meeting Bot API
RECALL_API_KEY=your_api_key_here
RECALL_REGION=us-west-2

# Optional: Webhook URL for real-time events
RECALL_WEBHOOK_URL=https://your-domain.com/webhook/recall
```

### 3. ビルド

```bash
npm run build
```

---

## 使い方

### Method 1: 会議URLにボットを送る（推奨）

会議が始まる前または会議中に、Meet URLを指定してボットを送ります。

```bash
npm run process-meeting -- --meetUrl https://meet.google.com/tfq-ydny-nkr
```

**動作：**
1. ボットが会議に参加リクエスト
2. 誰かがボットを承認
3. ボットが録画・文字起こし開始
4. 会議終了後、自動で議事録生成
5. Notion/Slackに自動投稿

**待機時間：**
- デフォルトで会議終了まで待機
- 会議が2時間続く場合、CLIは2時間待機

### Method 2: ボットIDで後から処理

ボットを送った後、CLIを終了して、後からボットIDで処理できます。

```bash
# Step 1: ボットを送る（CLIはすぐ終了）
# (Recall.aiダッシュボードで送るか、APIで送る)

# Step 2: 会議終了後、ボットIDで処理
npm run process-meeting -- --bot bot_abc123def456
```

### Method 3: カレンダー連携で自動化（将来機能）

```typescript
// カレンダーイベントから自動でボット送信
// 会議開始5分前に自動でボットを送る
```

---

## ワークフロー例

### 今夜0:50のテスト会議で使用

#### 準備（今）

```bash
# 1. Recall.ai API Keyを設定
echo "RECALL_API_KEY=your_key" >> .env
echo "RECALL_REGION=us-west-2" >> .env

# 2. ビルド
npm run build
```

#### 会議開始時（0:50）

```bash
# Google MeetのURLを取得
# 例: https://meet.google.com/tfq-ydny-nkr

# ボットを送る
npm run process-meeting -- --meetUrl https://meet.google.com/tfq-ydny-nkr
```

#### 会議中（0:50〜1:00）

1. あなたが会議に参加
2. 「AIMeet Recorder」（ボット）が参加リクエスト
3. **承認する**
4. ボットが録画開始
5. 普通に会議を進める
6. 会議終了

#### 会議終了後（自動）

1. ボットが自動で退出
2. CLIが文字起こしを取得
3. OpenAIで議事録生成
4. Notion/Slackに自動投稿
5. 完了！

---

## コスト計算

### Recall.ai 料金

- **基本料金**: 約$0.05/分
- **月額プラン**: 利用量に応じて割引あり

### 例

| 会議時間 | コスト |
|---------|--------|
| 10分 | $0.50 |
| 30分 | $1.50 |
| 1時間 | $3.00 |
| 2時間 | $6.00 |

### Whisperとの比較

| | Recall.ai | Whisper |
|---|----------|---------|
| **コスト/分** | $0.05 | $0.006 |
| **1時間あたり** | $3.00 | $0.36 |
| **録音方法** | 自動（ボット） | 手動 |
| **品質** | ビデオ+音声 | 音声のみ |
| **手間** | ゼロ | 録音必要 |

**結論**: Recall.aiは高いが、**完全自動**が最大の価値

---

## トラブルシューティング

### Error: "RECALL_API_KEY is required"

`.env`ファイルにAPI Keyが設定されていません。

```bash
echo "RECALL_API_KEY=your_actual_key" >> .env
```

### Error: "Failed to create bot"

- API Keyが正しいか確認
- リージョンが正しいか確認
- Recall.aiアカウントにクレジットがあるか確認

### ボットが承認されない

- 会議に自分が参加していることを確認
- ボットの参加リクエストを承認
- ウェイティングルームがある場合は手動で承認が必要

### 文字起こしが空

- ボットが会議に参加できたか確認
- 誰かが話したか確認
- 会議の言語設定を確認

### 会議が終わらない（CLIが待機し続ける）

- 会議を終了していない可能性
- Ctrl+Cで中断して、後から`--bot <id>`で処理

---

## 高度な使い方

### リアルタイムWebhook

会議中のイベントをリアルタイムで受け取る：

```bash
# .envに追加
RECALL_WEBHOOK_URL=https://your-domain.com/webhook/recall
```

Webhook受信例：

```typescript
// Express.jsでWebhookハンドラ
app.post('/webhook/recall', (req, res) => {
  const event = req.body;

  if (event.event_type === 'bot.status_change') {
    console.log('Bot status:', event.data.status);
  }

  if (event.event_type === 'bot.transcription.partial') {
    console.log('Real-time transcript:', event.data.text);
  }

  res.sendStatus(200);
});
```

### カスタムボット名

```typescript
// コードで直接呼び出す場合
import { createRecallServiceFromEnv } from './src/services/recall.js';

const recallService = createRecallServiceFromEnv();

const bot = await recallService.createBot({
  meetingUrl: 'https://meet.google.com/xxx-xxxx-xxx',
  botName: 'My Custom Bot Name',
  transcriptionProvider: 'deepgram', // または 'assembly_ai'
});
```

### 録画だけ（文字起こしなし）

```typescript
const bot = await recallService.createBot({
  meetingUrl: 'https://meet.google.com/xxx-xxxx-xxx',
  recordVideo: true,
  recordAudio: true,
  // transcriptionProvider を指定しない
});
```

---

## 他の方法との比較

### 1. Google Meet API（Workspace Pro必要）

```
コスト: $0（Workspace料金に含まれる）
手間: 会議中に文字起こしON
制限: Workspace Pro必須
```

### 2. Whisper API（今まで実装したもの）

```
コスト: $0.006/分（激安）
手間: 録音ファイル準備が必要
制限: 録音忘れリスク
```

### 3. Recall.ai（今実装したもの）

```
コスト: $0.05/分（少し高い）
手間: ゼロ（完全自動）
制限: ボットが見える
```

### おすすめの使い分け

| 状況 | 推奨方法 |
|-----|---------|
| 重要な会議で確実に録音したい | **Recall.ai** |
| コスト重視、手動OK | **Whisper** |
| Workspace Pro持っている | **Google Meet API** |
| テスト・実験 | **Whisper** |
| 本番運用 | **Recall.ai** |

---

## まとめ

Recall.ai統合により、AIMeetは**完全自動の議事録生成**が可能になりました。

**今夜0:50のテストで試してみましょう！**

```bash
# 会議開始時に実行
npm run process-meeting -- --meetUrl https://meet.google.com/tfq-ydny-nkr
```

質問があればいつでもどうぞ！ 🚀
