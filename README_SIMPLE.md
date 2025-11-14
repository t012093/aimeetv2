# AIMeet - 超簡単な使い方 🚀

## たった1つのコマンド

```bash
./bot <meet-url>
```

## 例

```bash
./bot https://meet.google.com/abc-defg-hij
```

## それだけ！

1. ボットが会議に参加
2. 自動で録画
3. 自動で文字起こし
4. 自動で議事録生成
5. ファイルに保存

## 手順

1. **コマンド実行**
   ```bash
   ./bot https://meet.google.com/xxx-xxxx-xxx
   ```

2. **会議に参加**
   - ブラウザでMeetを開く

3. **ボット承認**
   - 「AIMeet Recorder」を承認

4. **会議進行**
   - 普通に会議

5. **完了！**
   - 自動で議事録生成

## さらに簡単に

### エイリアス設定

```bash
echo "alias bot='~/Desktop/dev/aimeet/bot'" >> ~/.zshrc
source ~/.zshrc
```

これで、どこからでも：

```bash
bot https://meet.google.com/xxx-xxxx-xxx
```

---

## その他の便利コマンド

### インタラクティブモード

```bash
npm run record
```

対話形式で質問に答えるだけ。

### 音声ファイルから

```bash
npm run process-meeting -- --audio meeting.mp3
```

---

**それだけです！** 🎉
