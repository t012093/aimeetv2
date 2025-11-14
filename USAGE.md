# AIMeet 使い方ガイド

## 📹 会議を録画して議事録を自動生成

### 最もシンプルな方法

```bash
./bot https://meet.google.com/xxx-xxxx-xxx
```

これだけで：
1. Botが会議に参加
2. 録画・音声キャプチャ
3. 日本語トランスクリプション
4. GPT-4でAI要約
5. **自動的に `Record/YYYY/MM/meeting-YYYYMMDD-HHMMSS.md` に保存**

### 保存先の構造

```
aimeet/
├── Record/
│   ├── 2025/
│   │   ├── 11/
│   │   │   ├── meeting-2025-11-14-10-30-00.md
│   │   │   ├── meeting-2025-11-14-14-15-30.md
│   │   │   └── meeting-2025-11-14-16-45-00.md
│   │   └── 12/
│   │       ├── meeting-2025-12-01-09-00-00.md
│   │       └── meeting-2025-12-05-13-30-00.md
```

**年・月ごとにフォルダが自動作成されます**

## 📝 生成される議事録の形式

```markdown
# 会議議事録

**日付**: 2025年11月14日

## 概要

プロジェクトの進捗確認と次のマイルストーンについて議論しました...

## 重要なポイント

- 開発スケジュールを2週間前倒し
- 新機能のUIデザインが完成

## 決定事項

- ✅ ベータ版リリースを12月1日に実施
- ✅ 追加のエンジニア1名を採用

## アクションアイテム

- [ ] UIデザインのレビュー完了 - 担当: **山田** - 期限: *2025-11-20* (優先度: 🔴 高)
- [ ] テストケース作成 - 担当: **佐藤** (優先度: 🟡 中)

## 次のステップ

1. デザインチームとの最終確認ミーティングを設定
2. QAチームへのテスト環境準備

---

## Raw Data (JSON)

\`\`\`json
{
  "summary": "...",
  "keyPoints": [...],
  ...
}
\`\`\`
```

## 📂 カスタム保存先を指定する

### 特定のファイル名で保存

```bash
npm run process-meeting -- --meetUrl <URL> --output "重要会議.md"
```

→ `Record/2025/11/重要会議-2025-11-14-10-30-00.md` に保存

### 特定のディレクトリに保存

```bash
npm run process-meeting -- --meetUrl <URL> --output "projects/alpha/meeting.md"
```

→ `projects/alpha/meeting.md` に保存（ディレクトリ指定した場合はそのまま）

## 💰 料金

- **Recall.ai**: $0.15/時間（録画・日本語トランスクリプト）
- **OpenAI GPT-4**: 要約生成（通常 $0.01〜0.05/会議）

## ⚙️ 設定

### OpenAI APIキー

`.env`ファイルに設定：

```bash
OPENAI_API_KEY=sk-proj-...
```

クォータエラーが出た場合：
https://platform.openai.com/account/billing でクレジットを追加

### Recall.ai APIキー

`.env`ファイルに設定済み：

```bash
RECALL_API_KEY=50a33f5c81664b710e080b81fc9ffcbcd683b396
RECALL_REGION=us-west-2
```

## 🔄 その他のコマンド

### 既存のBotから議事録を生成

```bash
npm run process-meeting -- --bot <bot-id> --output meeting.md
```

### 音声ファイルから議事録を生成

```bash
npm run process-meeting -- --audio recording.mp3 --output meeting.md
```

### Google Calendar連携（最新の会議）

```bash
npm run process-meeting -- --recent --output meeting.md
```

## 📚 テンプレート

デフォルト以外のテンプレートを使用：

```bash
./bot <URL> --template npo       # NPO向け議事録
./bot <URL> --template government # 行政向け議事録
```

## 🆘 トラブルシューティング

### Botが会議に参加できない

- Google Meetの待合室でBotを承認してください
- Botの名前は "AIMeet Recorder" です

### トランスクリプトが空

- 会議中に発言があることを確認
- 日本語設定が正しいか確認（自動設定済み）

### OpenAI APIエラー

- クォータを確認: https://platform.openai.com/usage
- APIキーが正しいか確認

## 📞 サポート

問題が発生した場合は、生成されたファイルの末尾にある Raw Data (JSON) セクションを確認してください。
