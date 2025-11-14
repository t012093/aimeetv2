# Quick Start - 簡単な使い方

AIMeetを簡単に使うための方法をまとめました。

## 🚀 最も簡単な方法

### インタラクティブモード（推奨）

```bash
npm run record
```

対話形式で質問に答えるだけ！

```
🎙️  AIMeet Quick Record
============================================================

Choose recording method:
1. 📅 Upcoming calendar event
2. 🔗 Meeting URL
3. 🎵 Audio file

Enter choice (1-3):
```

---

## 📋 方法別クイックガイド

### 1️⃣ カレンダーから選ぶ（一番簡単）

```bash
npm run record
# → 1 を選択
# → 次の会議を一覧表示
# → 番号を選ぶだけ
```

**メリット:**
- ✅ URLをコピペ不要
- ✅ 次の会議が自動表示
- ✅ 1クリックで開始

### 2️⃣ Meet URLを貼り付け

```bash
npm run record
# → 2 を選択
# → URLを貼り付け
```

または直接：

```bash
./record-meeting.sh https://meet.google.com/xxx-xxxx-xxx
```

**メリット:**
- ✅ シェルスクリプトでさらに簡単
- ✅ ファイル名自動生成

### 3️⃣ 録音ファイルから

```bash
npm run record
# → 3 を選択
# → ファイルパスを入力
```

---

## 💡 もっと簡単にする方法

### エイリアス設定（おすすめ）

`~/.zshrc` または `~/.bashrc` に追加：

```bash
# AIMeet shortcuts
alias record-meet='cd ~/Desktop/dev/aimeet && npm run record'
alias aimeet='cd ~/Desktop/dev/aimeet && npm run record'
```

設定後：

```bash
source ~/.zshrc  # 設定を反映

# これだけで実行！
aimeet
```

### Alfred Workflow / Raycast拡張

**Alfred:**
```
Keyword: record
Script: cd ~/Desktop/dev/aimeet && npm run record
```

**Raycast:**
```
Title: Record Meeting
Command: #!/bin/bash
cd ~/Desktop/dev/aimeet && npm run record
```

これで `⌘ + Space` → `record` で起動！

---

## 🎯 実際の使用例

### 例1: 今すぐ始まる会議

```bash
aimeet
# → 1 (カレンダー)
# → 1 (最初の会議)
# → Enter (デフォルトファイル名)
```

**所要時間: 5秒**

### 例2: Meet URLをSlackで受け取った

```bash
./record-meeting.sh https://meet.google.com/abc-defg-hij
```

**所要時間: 2秒**（URLコピペのみ）

### 例3: 録音済みファイルを処理

```bash
aimeet
# → 3 (音声ファイル)
# → meeting.mp3 をドラッグ&ドロップ
# → Enter
```

**所要時間: 3秒**

---

## 📱 スマホから使う（将来機能）

**Shortcuts（iOS）で自動化:**

```
1. Shortcuts appを開く
2. 「Record with AIMeet」を作成
3. SSH接続でコマンド実行
4. 議事録をiCloudに保存
```

---

## ⚡ 究極の自動化

### カレンダー連携で完全自動

```typescript
// 将来実装予定
// cron job で5分ごとにチェック
// 次の会議が5分後なら自動でボット送信
```

**設定例:**
```bash
# crontab -e
*/5 * * * * cd ~/Desktop/dev/aimeet && node dist/scripts/auto-record.js
```

これで：
1. カレンダーイベント作成
2. （自動）5分前にボット送信
3. （自動）会議終了後、議事録生成
4. （自動）Notion/Slack投稿

**完全自動化達成！** 🎉

---

## 🔥 最速コマンド集

```bash
# インタラクティブ（推奨）
npm run record

# シェルスクリプト（シンプル）
./record-meeting.sh <meet-url>

# フルコマンド（詳細オプション）
npm run process-meeting -- --meetUrl <url> --output minutes.txt

# エイリアス設定後（最速）
aimeet
```

---

## 💬 よくある質問

**Q: 毎回 `cd ~/Desktop/dev/aimeet` するのが面倒**

A: エイリアスを設定してください（上記参照）

**Q: もっとUIが欲しい**

A: 将来Electron appやWeb UIを検討中

**Q: スマホから実行したい**

A: SSH経由またはWeb API実装を検討中

**Q: 完全に自動化したい**

A: cron + カレンダー連携を実装予定

---

## 🎯 まとめ

| 方法 | コマンド | 所要時間 |
|-----|---------|---------|
| **インタラクティブ** | `npm run record` | 5秒 |
| **シェルスクリプト** | `./record-meeting.sh <url>` | 2秒 |
| **エイリアス** | `aimeet` | 1秒 |
| **完全自動** | （設定後）自動 | 0秒！ |

**今すぐ試す:**
```bash
npm run record
```

簡単でしょう？ 🚀
