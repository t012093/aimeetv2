# AIMeet 将来構想ロードマップ

## 概要

AIMeetをNPO運営の包括的な自動化プラットフォームに進化させる構想。議事録作成だけでなく、タスク管理、スケジュール調整、会計処理、コミュニケーション連携まで、AI駆動で自動化する。

---

## 🎯 Phase 3: タスク管理・自動化

### 3.1 GitHub Issues連携

**目的**: 議事録から抽出したアクションアイテムをGitHub Issuesとして自動登録・管理

#### 機能
- 議事録のアクションアイテムを自動的にGitHub Issueに変換
- 優先度（high/medium/low）をラベルとして設定
- 担当者を自動アサイン
- 期限をDue Dateとして設定
- 会議へのリンクを含む詳細な説明を自動生成

#### 実装案
```typescript
interface GitHubIntegration {
  createIssueFromActionItem(item: ActionItem, meetingUrl: string): Promise<Issue>;
  updateIssueStatus(issueId: string, status: 'open' | 'in-progress' | 'closed'): Promise<void>;
  syncActionItemsWithIssues(actionItems: ActionItem[]): Promise<SyncResult>;
}
```

#### 技術スタック
- GitHub REST API / GraphQL API
- GitHub Actions (自動ワークフロー)
- Octokit (GitHub API クライアント)

---

### 3.2 タスク実行自動化

**目的**: 定型タスクをAIが自動実行

#### 機能
- 繰り返し発生するタスクの検出と自動化提案
- スクリプト生成による自動実行
- タスク完了の自動報告

#### ユースケース
- 定期レポートの作成
- データ集計・分析
- ファイル整理・バックアップ
- 通知・リマインダー送信

#### 実装案
```typescript
interface TaskAutomation {
  detectRepetitiveTasks(meetings: MeetingMinutes[]): RepetitiveTask[];
  generateAutomationScript(task: RepetitiveTask): AutomationScript;
  executeTask(script: AutomationScript): Promise<TaskResult>;
  reportCompletion(result: TaskResult): Promise<void>;
}
```

---

## 📅 Phase 4: AI スケジュール調整

### 4.1 メンバー管理統合

**目的**: Googleスプレッドシート、Notionデータベースからメンバー情報を統合管理

#### データソース
- **Googleスプレッドシート**: シフト表、稼働状況
- **Notion**: メンバープロフィール、プロジェクト参加状況
- **Googleカレンダー**: 個人の予定、空き状況

#### 統合情報
```typescript
interface MemberAvailability {
  memberId: string;
  name: string;
  email: string;
  // Googleスプレッドシートから取得
  shifts: Shift[];
  workingHours: WorkingHours[];
  // Googleカレンダーから取得
  busySlots: TimeSlot[];
  freeSlots: TimeSlot[];
  // Notionから取得
  projects: Project[];
  roles: string[];
  preferences: SchedulePreferences;
}
```

---

### 4.2 AI会議日程自動調整

**目的**: メンバーの空き状況を分析し、最適な会議日程をAIが提案・自動設定

#### 機能
1. **空き状況分析**
   - 全メンバーのGoogleカレンダーを確認
   - スプレッドシートのシフト表と照合
   - タイムゾーンを考慮

2. **最適日程提案**
   - 参加必須メンバーの優先
   - 過去の会議パターン学習
   - メンバーの好みの時間帯を考慮
   - 会議の重要度に応じた調整

3. **自動スケジューリング**
   - 最適候補日時を3-5件提案
   - 承認後、自動的にカレンダー登録
   - 参加者への通知送信
   - Meet URLの自動生成

#### 実装案
```typescript
interface AIScheduler {
  // メンバー情報を統合
  aggregateMemberData(memberIds: string[]): Promise<MemberAvailability[]>;

  // 空き時間を検出
  findCommonFreeSlots(
    members: MemberAvailability[],
    duration: number,
    timeRange: DateRange,
    constraints?: ScheduleConstraints
  ): Promise<TimeSlot[]>;

  // AIが最適な日程を提案
  suggestOptimalMeetingTimes(
    slots: TimeSlot[],
    meetingContext: MeetingContext,
    previousMeetings?: MeetingMinutes[]
  ): Promise<SuggestedTime[]>;

  // 自動予約
  scheduleAndNotify(
    selectedTime: TimeSlot,
    participants: string[],
    meetingDetails: MeetingDetails
  ): Promise<CalendarEvent>;
}

interface SuggestedTime {
  slot: TimeSlot;
  score: number; // 0-100
  reasoning: string;
  participantAvailability: {
    memberId: string;
    status: 'available' | 'busy' | 'tentative';
    conflicts?: CalendarEvent[];
  }[];
}
```

#### AI判断基準
- **必須参加者の空き**: 最優先
- **会議履歴**: 過去の定例会議時間を参考
- **時間帯の好み**: 朝型/夜型メンバーを考慮
- **連続会議の回避**: 休憩時間を確保
- **移動時間**: 対面会議の場合

---

## 💰 Phase 5: 会計AI自動化

### 5.1 決済システム連携

**目的**: 入出金データを自動取得し、会計処理を完全自動化

#### 連携サービス
1. **Stripe**
   - オンライン決済データ
   - サブスクリプション管理
   - 寄付金受付

2. **GMO Payment Gateway**
   - クレジットカード決済
   - コンビニ決済
   - 銀行振込

3. **freee**
   - 仕訳自動作成
   - 請求書発行
   - 確定申告対応

#### データフロー
```
Stripe/GMO → AI会計処理 → Googleスプレッドシート/Notion → freee
                ↓
           自動仕訳・分類
                ↓
           月次レポート自動生成
```

---

### 5.2 AI会計処理エンジン

**目的**: 取引データをAIが自動分類・仕訳し、会計帳簿を作成

#### 機能
1. **自動仕訳**
   - 取引内容をAIが解析
   - 勘定科目を自動判定
   - 税区分の自動設定
   - 補助科目・タグ付け

2. **異常検知**
   - 重複取引の検出
   - 金額の異常値チェック
   - 未処理取引のアラート

3. **レポート自動生成**
   - 月次収支レポート
   - プロジェクト別予算管理
   - 資金繰り予測
   - 助成金申請用資料

#### 実装案
```typescript
interface AIAccountingEngine {
  // 取引データ取得
  fetchTransactions(
    sources: ('stripe' | 'gmo' | 'bank')[],
    dateRange: DateRange
  ): Promise<Transaction[]>;

  // AI自動仕訳
  categorizeTransaction(transaction: Transaction): Promise<JournalEntry>;

  // 一括処理
  processTransactions(
    transactions: Transaction[]
  ): Promise<ProcessingResult>;

  // Notion/スプレッドシートへ出力
  exportToNotion(entries: JournalEntry[]): Promise<void>;
  exportToSpreadsheet(entries: JournalEntry[]): Promise<void>;

  // freee連携
  syncToFreee(entries: JournalEntry[]): Promise<FreeeResult>;

  // レポート生成
  generateMonthlyReport(month: string): Promise<FinancialReport>;
  generateProjectReport(projectId: string): Promise<ProjectFinancials>;
}

interface Transaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  source: 'stripe' | 'gmo' | 'bank' | 'cash';
  type: 'income' | 'expense';
  rawData: any;
}

interface JournalEntry {
  transactionId: string;
  date: Date;
  debit: {
    account: string;      // 借方科目
    amount: number;
    taxCategory?: string;
  };
  credit: {
    account: string;      // 貸方科目
    amount: number;
    taxCategory?: string;
  };
  description: string;
  project?: string;
  tags: string[];
  confidence: number;     // AIの判定信頼度 0-100
  needsReview: boolean;   // 人間の確認が必要か
}
```

#### AI仕訳ロジック
```typescript
// プロンプト例
const accountingPrompt = `
以下の取引を分析し、適切な仕訳を提案してください：

取引情報:
- 日付: ${transaction.date}
- 金額: ${transaction.amount}円
- 説明: ${transaction.description}
- 取引元: ${transaction.source}

NPOの勘定科目:
- 収入: 会費収入、寄付金収入、事業収入、助成金収入
- 支出: 人件費、旅費交通費、通信費、消耗品費、会議費、印刷費

過去の類似取引:
${similarTransactions}

JSON形式で仕訳を返してください。
`;
```

---

### 5.3 Notion/Googleスプレッドシート会計管理

**目的**: 会計データをNotionとスプレッドシートで可視化・管理

#### Notion会計データベース構造
```
【収支管理DB】
- 日付
- 取引先
- 科目
- 金額
- 摘要
- プロジェクト（Relation）
- 承認状態（Select: 未承認/承認済み/要確認）
- 添付ファイル（領収書画像）

【プロジェクト予算DB】
- プロジェクト名
- 予算額
- 実績額
- 残額（Formula）
- 進捗率（Formula）
- 担当者

【月次レポートDB】
- 年月
- 総収入
- 総支出
- 収支（Formula）
- レポートページ（Relation）
```

#### Googleスプレッドシート構造
```
【取引一覧シート】
日付 | 科目 | 摘要 | 収入 | 支出 | 残高 | プロジェクト | ステータス

【月次集計シート】
自動ピボットテーブル
- 科目別集計
- プロジェクト別集計
- 月次推移グラフ

【予算管理シート】
プロジェクト | 予算 | 実績 | 差異 | 進捗率 | アラート
```

---

## 💬 Phase 6: Slack高度連携

### 6.1 議事録自動共有

**目的**: 会議終了後、自動的にSlackに議事録を投稿

#### 機能
1. **チャンネル自動選択**
   - プロジェクトタイプに応じて投稿先を決定
   - 例: `#international-team`, `#programming-class`, `#art-project`

2. **リッチフォーマット投稿**
   - Slack Block Kitを使用した見やすい表示
   - アクションアイテムはチェックボックスとして表示
   - Notionページへのリンク

3. **メンション自動付与**
   - アクションアイテムの担当者に自動メンション
   - 重要な決定事項は@hereで通知

#### 実装例
```typescript
interface SlackMinutesShare {
  // プロジェクトに応じたチャンネル選択
  selectChannel(projectType: ProjectType): string;

  // Slack Block形式に変換
  formatMinutesAsBlocks(minutes: MeetingMinutes): SlackBlock[];

  // 投稿
  postMinutes(
    channel: string,
    minutes: MeetingMinutes,
    notionUrl: string
  ): Promise<SlackMessageResponse>;

  // 担当者メンション
  mentionAssignees(actionItems: ActionItem[]): Promise<void>;
}
```

---

### 6.2 Slackトーク要約機能

**目的**: Slackの会話をAIが要約し、Notionにまとめる

#### 機能
1. **コマンド起動**
   ```
   /aimeet summarize #channel 2024-01-01 2024-01-07
   /aimeet summarize thread <thread-url>
   /aimeet summarize last 100
   ```

2. **AI要約生成**
   - 会話の流れを分析
   - 重要な決定事項を抽出
   - アクションアイテムを検出
   - 参加者一覧

3. **Notion自動保存**
   - 専用データベースに保存
   - 関連プロジェクトとリンク
   - 元のSlackスレッドへのリンク

#### 実装案
```typescript
interface SlackSummarizer {
  // メッセージ取得
  fetchMessages(
    channel: string,
    options: {
      since?: Date;
      until?: Date;
      thread?: string;
      limit?: number;
    }
  ): Promise<SlackMessage[]>;

  // AI要約生成
  summarizeConversation(
    messages: SlackMessage[]
  ): Promise<ConversationSummary>;

  // Notionに保存
  saveToNotion(
    summary: ConversationSummary,
    projectType: ProjectType
  ): Promise<NotionPage>;

  // Slackに結果投稿
  replyWithSummary(
    channel: string,
    summary: ConversationSummary,
    notionUrl: string
  ): Promise<void>;
}

interface ConversationSummary {
  period: DateRange;
  participants: string[];
  mainTopics: string[];
  decisions: string[];
  actionItems: ActionItem[];
  keyMessages: {
    user: string;
    message: string;
    timestamp: Date;
    permalink: string;
  }[];
  summary: string;
}
```

---

### 6.3 Slackボットコマンド拡張

**目的**: Slack上で様々な操作を可能にする対話型ボット

#### コマンド一覧
```
# 議事録関連
/aimeet record start          # 会議記録開始
/aimeet record stop           # 会議記録終了
/aimeet latest                # 最新の議事録を表示

# タスク管理
/aimeet tasks list            # 自分のタスク一覧
/aimeet tasks create          # タスク作成（対話形式）
/aimeet tasks complete <id>   # タスク完了

# スケジュール
/aimeet schedule meeting      # 会議日程調整開始
/aimeet availability @user    # メンバーの空き確認
/aimeet calendar              # 今週の予定確認

# 会計
/aimeet expense submit        # 経費申請
/aimeet budget <project>      # プロジェクト予算確認
/aimeet report monthly        # 月次レポート

# 要約・検索
/aimeet summarize             # 会話要約
/aimeet search <keyword>      # 過去の議事録検索
/aimeet qa <question>         # ナレッジベースに質問
```

---

## 🔗 Phase 7: ブロックチェーン報酬システム

### 7.1 概要

**目的**: NPO活動への貢献を自動的に評価し、ブロックチェーンベースの報酬トークンを公平に分配する透明性の高い報酬システム

#### ビジョン
- 議事録やタスク完了を基にAIが貢献度を自動評価
- 公平で透明性の高いトークン報酬
- DAO（分散型自律組織）としてのNPO運営
- コミュニティへの長期的なインセンティブ設計

---

### 7.2 トークンエコノミクス設計

#### トークン基本仕様
```typescript
interface NPORewardToken {
  name: string;           // 例: "NPO Contributor Token (NCT)"
  symbol: string;         // 例: "NCT"
  blockchain: 'ethereum' | 'polygon' | 'arbitrum' | 'base';
  standard: 'ERC20' | 'ERC1155';  // 功績トークン用にNFTも検討
  totalSupply?: number;   // 固定供給 or インフレ設計
  decimals: number;       // 18が標準
}
```

#### トークンユーティリティ（使い道）
1. **ガバナンス権**
   - プロジェクトの意思決定投票権
   - 予算配分の投票
   - 新規プロジェクト提案・承認

2. **特典・報酬**
   - NPOイベント優先参加権
   - 限定グッズ・特典との交換
   - スキルアップ研修への参加権

3. **ステーキング報酬**
   - トークンをロックして追加報酬獲得
   - 長期コミット者への優遇

4. **外部取引（将来的）**
   - DEX（分散型取引所）での取引
   - 他NPOトークンとの交換

---

### 7.3 AI貢献度評価エンジン

**目的**: 議事録、タスク、会議参加などの活動データからAIが公平に貢献度を算出

#### 評価指標
```typescript
interface ContributionMetrics {
  // 会議関連
  meetingAttendance: {
    count: number;              // 参加回数
    punctuality: number;        // 時間通り参加 0-100
    speakingTime: number;       // 発言時間（分）
    engagementScore: number;    // AI評価の積極性 0-100
  };

  // タスク関連
  taskCompletion: {
    completed: number;          // 完了タスク数
    onTime: number;             // 期限内完了数
    quality: number;            // AI評価の品質スコア 0-100
    difficulty: number;         // タスク難易度加重平均
  };

  // 議事録・ドキュメント
  documentation: {
    pagesCreated: number;       // 作成ページ数
    edits: number;              // 編集貢献
    quality: number;            // 内容の質（AI評価）
  };

  // コミュニケーション
  communication: {
    slackMessages: number;      // 有益なメッセージ数
    helpfulness: number;        // 他者支援スコア
    mentorship: number;         // メンタリング貢献
  };

  // プロジェクト成果
  projectImpact: {
    projectsLed: number;        // リードしたプロジェクト
    outcomesAchieved: number;   // 達成した成果
    innovationScore: number;    // 革新性スコア（AI評価）
  };
}
```

#### AI評価アルゴリズム
```typescript
interface AIContributionEvaluator {
  // 総合貢献度スコア算出
  calculateContributionScore(
    memberId: string,
    period: DateRange,
    metrics: ContributionMetrics
  ): Promise<ContributionScore>;

  // トークン報酬額計算
  calculateTokenReward(
    score: ContributionScore,
    tokenPool: number,        // 配分可能なトークン総量
    allScores: ContributionScore[]
  ): Promise<TokenReward>;

  // 貢献の質的評価（AI）
  evaluateQuality(
    contribution: Contribution
  ): Promise<QualityScore>;

  // 異常検知（不正防止）
  detectAnomalies(
    rewards: TokenReward[]
  ): Promise<AnomalyReport>;
}

interface ContributionScore {
  memberId: string;
  period: DateRange;
  totalScore: number;           // 0-1000
  breakdown: {
    meeting: number;            // 会議貢献 0-200
    task: number;               // タスク貢献 0-300
    documentation: number;      // ドキュメント 0-150
    communication: number;      // コミュニケーション 0-150
    projectImpact: number;      // プロジェクト成果 0-200
  };
  multipliers: {
    consistency: number;        // 継続性ボーナス 1.0-1.5
    leadership: number;         // リーダーシップ 1.0-1.3
    innovation: number;         // 革新性 1.0-1.2
  };
  finalScore: number;          // totalScore × multipliers
}

interface TokenReward {
  memberId: string;
  amount: number;              // トークン数
  reason: string;              // 報酬理由（自動生成）
  breakdown: {
    category: string;
    score: number;
    tokens: number;
  }[];
  confidence: number;          // AI判定の信頼度 0-100
  requiresReview: boolean;     // 異常値の場合true
}
```

---

### 7.4 報酬配分ロジック

#### 月次報酬サイクル
```typescript
interface MonthlyRewardCycle {
  // 1. データ収集（月初1-3日）
  async collectMonthlyData(month: string): Promise<MemberMetrics[]> {
    // 議事録、タスク、Slack、GitHubなど全データ集約
  }

  // 2. AI評価（月初4-5日）
  async evaluateContributions(
    metrics: MemberMetrics[]
  ): Promise<ContributionScore[]> {
    // AIが各メンバーの貢献度を評価
  }

  // 3. トークン配分計算（月初6日）
  async calculateDistribution(
    scores: ContributionScore[],
    monthlyTokenPool: number
  ): Promise<TokenReward[]> {
    // 相対評価でトークン配分を決定
  }

  // 4. レビュー期間（月初7-10日）
  async reviewPeriod(
    rewards: TokenReward[]
  ): Promise<ApprovedReward[]> {
    // 異常値のレビュー、異議申し立て受付
  }

  // 5. ブロックチェーン配布（月初11日）
  async distributeTokens(
    rewards: ApprovedReward[]
  ): Promise<TransactionReceipt[]> {
    // スマートコントラクト経由でトークン送信
  }

  // 6. 通知・透明性レポート（月初12日）
  async notifyAndReport(
    distribution: TokenDistribution
  ): Promise<void> {
    // Slack通知、Notionレポート作成
  }
}
```

#### 配分例
```
月間トークンプール: 10,000 NCT

メンバーA（貢献度スコア: 850）: 2,500 NCT
- タスク完了: 15件（高品質）
- 会議参加: 100%
- プロジェクトリード: 1件

メンバーB（貢献度スコア: 650）: 1,900 NCT
- タスク完了: 10件
- 会議参加: 80%
- ドキュメント作成: 多数

メンバーC（貢献度スコア: 420）: 1,200 NCT
- タスク完了: 5件
- 会議参加: 60%
- サポート貢献: 中程度

...（全メンバー合計で10,000 NCT）
```

---

### 7.5 スマートコントラクト設計

#### コントラクト構成
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * NPO貢献報酬トークン
 */
contract NPOContributorToken is ERC20, AccessControl {
    bytes32 public constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

    // 貢献記録（透明性のため）
    struct ContributionRecord {
        address contributor;
        uint256 amount;
        string reason;
        uint256 timestamp;
        bytes32 dataHash;  // オフチェーンデータのハッシュ
    }

    mapping(uint256 => ContributionRecord) public contributions;
    uint256 public contributionCount;

    event TokensDistributed(
        address indexed recipient,
        uint256 amount,
        string reason,
        bytes32 dataHash
    );

    constructor() ERC20("NPO Contributor Token", "NCT") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(DISTRIBUTOR_ROLE, msg.sender);
    }

    /**
     * AIシステムからのトークン配布
     */
    function distributeReward(
        address recipient,
        uint256 amount,
        string memory reason,
        bytes32 dataHash
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        _mint(recipient, amount);

        contributions[contributionCount] = ContributionRecord({
            contributor: recipient,
            amount: amount,
            reason: reason,
            timestamp: block.timestamp,
            dataHash: dataHash
        });

        emit TokensDistributed(recipient, amount, reason, dataHash);
        contributionCount++;
    }

    /**
     * バッチ配布（ガス効率化）
     */
    function batchDistribute(
        address[] memory recipients,
        uint256[] memory amounts,
        string[] memory reasons,
        bytes32[] memory dataHashes
    ) external onlyRole(DISTRIBUTOR_ROLE) {
        require(
            recipients.length == amounts.length &&
            amounts.length == reasons.length &&
            reasons.length == dataHashes.length,
            "Array lengths must match"
        );

        for (uint256 i = 0; i < recipients.length; i++) {
            distributeReward(recipients[i], amounts[i], reasons[i], dataHashes[i]);
        }
    }

    /**
     * ガバナンス投票用の投票権計算
     */
    function getVotingPower(address account) external view returns (uint256) {
        return balanceOf(account);
    }
}
```

#### ガバナンスコントラクト（DAO）
```solidity
/**
 * NPO DAOガバナンス
 * トークン保有者による意思決定
 */
contract NPOGovernance {
    struct Proposal {
        uint256 id;
        address proposer;
        string title;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        ProposalType proposalType;
    }

    enum ProposalType {
        BUDGET_ALLOCATION,      // 予算配分
        PROJECT_APPROVAL,       // プロジェクト承認
        POLICY_CHANGE,          // 方針変更
        TOKEN_PARAMETER         // トークン設定変更
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    NPOContributorToken public token;

    function createProposal(
        string memory title,
        string memory description,
        ProposalType proposalType
    ) external returns (uint256) {
        // 提案作成（一定トークン保有が必要）
        require(
            token.balanceOf(msg.sender) >= 100 * 10**18,
            "Insufficient tokens to propose"
        );
        // ... 提案作成ロジック
    }

    function vote(uint256 proposalId, bool support) external {
        // 投票（トークン量に応じた投票権）
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        uint256 votingPower = token.getVotingPower(msg.sender);
        require(votingPower > 0, "No voting power");

        if (support) {
            proposals[proposalId].forVotes += votingPower;
        } else {
            proposals[proposalId].againstVotes += votingPower;
        }

        hasVoted[proposalId][msg.sender] = true;
    }
}
```

---

### 7.6 ブロックチェーン連携実装

#### TypeScript統合
```typescript
import { ethers } from 'ethers';
import { TokenReward } from './ai-evaluator';

interface BlockchainService {
  // ウォレット情報管理
  registerWallet(memberId: string, walletAddress: string): Promise<void>;
  getWallet(memberId: string): Promise<string>;

  // トークン配布
  distributeTokens(rewards: TokenReward[]): Promise<TransactionReceipt[]>;
  batchDistribute(rewards: TokenReward[]): Promise<TransactionReceipt>;

  // 残高確認
  getBalance(walletAddress: string): Promise<number>;
  getAllBalances(): Promise<Map<string, number>>;

  // ガバナンス
  createProposal(proposal: Proposal): Promise<string>;
  vote(proposalId: string, support: boolean, voterId: string): Promise<void>;
  executeProposal(proposalId: string): Promise<void>;

  // 透明性・監査
  getContributionHistory(memberId: string): Promise<ContributionRecord[]>;
  verifyDistribution(txHash: string): Promise<DistributionProof>;
}

class EthereumBlockchainService implements BlockchainService {
  private provider: ethers.Provider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor(
    rpcUrl: string,
    contractAddress: string,
    privateKey: string
  ) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);
    this.contract = new ethers.Contract(
      contractAddress,
      NPO_TOKEN_ABI,
      this.wallet
    );
  }

  async distributeTokens(
    rewards: TokenReward[]
  ): Promise<TransactionReceipt[]> {
    const receipts: TransactionReceipt[] = [];

    for (const reward of rewards) {
      const wallet = await this.getWallet(reward.memberId);

      // トークン量を wei に変換（18 decimals）
      const amount = ethers.parseEther(reward.amount.toString());

      // データハッシュ作成（透明性のため）
      const dataHash = ethers.keccak256(
        ethers.toUtf8Bytes(JSON.stringify(reward))
      );

      // スマートコントラクト呼び出し
      const tx = await this.contract.distributeReward(
        wallet,
        amount,
        reward.reason,
        dataHash
      );

      const receipt = await tx.wait();
      receipts.push(receipt);

      console.log(`✅ Distributed ${reward.amount} NCT to ${reward.memberId}`);
      console.log(`   Tx: ${receipt.hash}`);
    }

    return receipts;
  }

  async batchDistribute(
    rewards: TokenReward[]
  ): Promise<TransactionReceipt> {
    // ガス効率化のためバッチ処理
    const addresses = await Promise.all(
      rewards.map(r => this.getWallet(r.memberId))
    );
    const amounts = rewards.map(r =>
      ethers.parseEther(r.amount.toString())
    );
    const reasons = rewards.map(r => r.reason);
    const dataHashes = rewards.map(r =>
      ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(r)))
    );

    const tx = await this.contract.batchDistribute(
      addresses,
      amounts,
      reasons,
      dataHashes
    );

    const receipt = await tx.wait();
    console.log(`✅ Batch distributed to ${rewards.length} members`);
    console.log(`   Tx: ${receipt.hash}`);

    return receipt;
  }
}
```

---

### 7.7 統合フロー

#### 月次報酬配布フロー
```typescript
interface MonthlyRewardDistribution {
  async executeMonthlyDistribution(month: string): Promise<void> {
    console.log(`🚀 Starting monthly token distribution for ${month}`);

    // 1. 貢献データ収集
    console.log('📊 Step 1: Collecting contribution data...');
    const meetings = await this.getMeetingMinutes(month);
    const tasks = await this.getCompletedTasks(month);
    const slackActivity = await this.getSlackActivity(month);
    const githubActivity = await this.getGitHubActivity(month);

    // 2. メンバーごとのメトリクス集計
    console.log('📈 Step 2: Aggregating member metrics...');
    const metrics = await this.aggregateMetrics({
      meetings,
      tasks,
      slackActivity,
      githubActivity
    });

    // 3. AI貢献度評価
    console.log('🤖 Step 3: AI evaluating contributions...');
    const scores = await this.aiEvaluator.evaluateContributions(metrics);

    // 4. トークン配分計算
    console.log('💰 Step 4: Calculating token distribution...');
    const monthlyPool = 10000; // 月間配布トークン数
    const rewards = await this.aiEvaluator.calculateTokenReward(
      scores,
      monthlyPool
    );

    // 5. 異常検知
    console.log('🔍 Step 5: Detecting anomalies...');
    const anomalies = await this.aiEvaluator.detectAnomalies(rewards);
    if (anomalies.length > 0) {
      console.log('⚠️  Anomalies detected, requiring review:');
      anomalies.forEach(a => console.log(`   - ${a.description}`));
    }

    // 6. 人間レビュー期間（異常値のみ）
    const reviewRequired = rewards.filter(r => r.requiresReview);
    if (reviewRequired.length > 0) {
      console.log('👥 Step 6: Human review required...');
      await this.notifyReviewers(reviewRequired);
      await this.waitForApproval();
    }

    // 7. Notion透明性レポート作成
    console.log('📝 Step 7: Creating transparency report...');
    const reportUrl = await this.createNotionReport(rewards, scores);

    // 8. Slack通知（事前通知）
    console.log('📢 Step 8: Notifying members...');
    await this.slackService.notifyUpcomingDistribution(rewards, reportUrl);

    // 9. ブロックチェーンにトークン配布
    console.log('⛓️  Step 9: Distributing tokens on blockchain...');
    const receipts = await this.blockchainService.batchDistribute(rewards);

    // 10. 配布完了通知
    console.log('✅ Step 10: Distribution complete!');
    await this.slackService.notifyDistributionComplete(rewards, receipts);
    await this.updateNotionWithTxHashes(rewards, receipts);

    console.log(`🎉 Monthly distribution for ${month} completed!`);
    console.log(`   Total distributed: ${monthlyPool} NCT`);
    console.log(`   Recipients: ${rewards.length}`);
    console.log(`   Transaction hash: ${receipts[0].hash}`);
  }
}
```

---

### 7.8 透明性・監査システム

#### Notion貢献トラッカー
```
【月次トークン配布DB】
- 年月
- メンバー（Relation）
- 配布額（NCT）
- 貢献スコア
- 内訳（会議/タスク/ドキュメント/等）
- 理由（AI生成）
- トランザクションハッシュ
- ブロックチェーン確認リンク

【個人貢献履歴DB】
- メンバー
- 日付
- 貢献タイプ（会議/タスク/等）
- 詳細
- ポイント
- 累積トークン
```

#### ブロックチェーンエクスプローラー統合
```typescript
interface TransparencyDashboard {
  // Etherscan等へのリンク生成
  getTransactionUrl(txHash: string): string;
  getAddressUrl(address: string): string;

  // オンチェーンデータ検証
  verifyDistribution(
    month: string,
    memberId: string
  ): Promise<OnChainProof>;

  // 配布履歴の完全な透明性
  getFullDistributionHistory(): Promise<DistributionRecord[]>;
}
```

---

### 7.9 セキュリティ・ガバナンス

#### マルチシグウォレット
- トークン配布用ウォレットは3/5マルチシグ
- 理事会メンバーが鍵を保持
- 大規模配布は複数承認が必要

#### 不正防止メカニズム
1. **AI異常検知**
   - 急激なスコア変動を検出
   - パターン分析で不自然な行動を発見

2. **コミュニティレビュー**
   - 異常値は必ず人間がレビュー
   - 異議申し立て期間（7日間）

3. **オンチェーン記録**
   - すべての配布がブロックチェーンに記録
   - 改ざん不可能な透明性

4. **タイムロック**
   - 大規模配布は24時間のタイムロック
   - 緊急時のキャンセル可能

---

### 7.10 技術スタック

#### ブロックチェーン
- **メインネット候補**:
  - Polygon (低ガス、高速)
  - Arbitrum (Ethereum L2、セキュア)
  - Base (Coinbaseサポート、使いやすい)
  - Optimism (L2、DAO向け)

- **開発・テスト**:
  - Hardhat (スマートコントラクト開発)
  - Foundry (高度なテスト)
  - Tenderly (デバッグ・監視)

#### ライブラリ
```bash
npm install ethers@6
npm install @openzeppelin/contracts
npm install @openzeppelin/contracts-upgradeable
npm install hardhat
npm install @nomicfoundation/hardhat-toolbox
```

#### インフラ
- **RPC Provider**: Alchemy / Infura / QuickNode
- **ウォレット管理**: AWS KMS / GCP Secret Manager
- **監視**: The Graph (オンチェーンデータインデックス)

---

### 7.11 環境変数

```bash
# Blockchain Configuration
BLOCKCHAIN_NETWORK=polygon  # polygon, arbitrum, base, ethereum
BLOCKCHAIN_RPC_URL=https://polygon-rpc.com
CONTRACT_ADDRESS=0x...
DEPLOYER_PRIVATE_KEY=0x...  # マルチシグ推奨

# Token Configuration
MONTHLY_TOKEN_POOL=10000
TOKEN_DECIMALS=18

# Security
MULTISIG_WALLET=0x...
TIMELOCK_DURATION=86400  # 24 hours in seconds

# Monitoring
ETHERSCAN_API_KEY=...
THE_GRAPH_API_KEY=...
```

---

### 7.12 実装ロードマップ

| マイルストーン | タスク | 期間 |
|:-------------|:------|:----:|
| **M1: 基礎** | スマートコントラクト開発 | 3週間 |
| | テストネットデプロイ | 1週間 |
| | 評価アルゴリズム実装 | 2週間 |
| **M2: 統合** | AIMeetとの連携 | 2週間 |
| | ウォレット管理システム | 1週間 |
| | 配布自動化 | 2週間 |
| **M3: テスト** | 内部テスト（3ヶ月） | 12週間 |
| | フィードバック収集・改善 | 継続 |
| **M4: 本番** | メインネットデプロイ | 1週間 |
| | ガバナンスDAO立ち上げ | 2週間 |
| | コミュニティ教育 | 継続 |

**推定総工数**: 約3-4ヶ月

---

### 7.13 リスク・課題

#### 技術リスク
- **ガス代変動**: L2使用で軽減
- **スマートコントラクトバグ**: 監査必須
- **秘密鍵管理**: マルチシグ、HSM使用

#### 法的・規制リスク
- **トークン規制**: 弁護士相談必須
- **税務処理**: 報酬の課税関係を明確化
- **証券性**: ユーティリティトークン設計で回避

#### 運用リスク
- **AI誤評価**: 人間レビュープロセス必須
- **コミュニティ分裂**: 透明性とガバナンスで対処
- **価値変動**: ステーブルな設計、外部取引の制限検討

---

### 7.14 成功指標（KPI）

- **参加率**: アクティブメンバーの80%以上がトークン獲得
- **公平性**: ジニ係数 < 0.4（適度な分散）
- **継続性**: トークン獲得者の次月参加率 > 90%
- **透明性**: 配布に対する異議申し立て < 5%
- **ガバナンス参加**: 提案の投票参加率 > 60%

---

## 🏗️ システムアーキテクチャ

### 全体構成
```
┌─────────────────────────────────────────────────────────────┐
│                        Slack Workspace                       │
│  - 議事録自動投稿                                              │
│  - ボットコマンド                                              │
│  - 会話要約                                                   │
│  - トークン配布通知                                            │
└───────────────────┬─────────────────────────────────────────┘
                    │
┌───────────────────▼─────────────────────────────────────────┐
│                      AIMeet Core System                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Meeting Bot  │  │ AI Scheduler │  │ AI Accounting│      │
│  │   (Recall)   │  │              │  │    Engine    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Minutes    │  │  Task Auto   │  │    Slack     │      │
│  │  Generator   │  │   mation     │  │  Summarizer  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────────────────────────────────────────┐      │
│  │         AI Contribution Evaluator                 │      │
│  │  - 会議参加評価  - タスク完了評価                    │      │
│  │  - ドキュメント貢献  - コミュニケーション分析          │      │
│  │  - プロジェクト成果  - トークン配分計算              │      │
│  └──────────────────────────────────────────────────┘      │
└───────────────────┬─────────────────────────────────────────┘
                    │
    ┌───────────────┼───────────────┬──────────────┐
    │               │               │              │
┌───▼────┐    ┌────▼─────┐   ┌────▼─────┐  ┌─────▼──────┐
│ Notion │    │  Google  │   │  GitHub  │  │ Blockchain │
│   DB   │    │ Calendar │   │  Issues  │  │  (Polygon/ │
└────────┘    │ Sheets   │   └──────────┘  │  Arbitrum) │
              └──────────┘                  └─────┬──────┘
                    │                             │
         ┌──────────┼──────────┐            ┌─────▼──────┐
         │          │          │            │   Token    │
    ┌────▼───┐ ┌───▼────┐ ┌──▼────┐       │ Contract   │
    │ Stripe │ │  GMO   │ │ freee │       │  (ERC20)   │
    └────────┘ └────────┘ └───────┘       └────────────┘
                                                  │
                                           ┌──────▼──────┐
                                           │ Governance  │
                                           │     DAO     │
                                           └─────────────┘
```

---

## 🗂️ データモデル統合

### 中核データ構造
```typescript
// プロジェクト統合管理
interface IntegratedProject {
  id: string;
  name: string;
  type: ProjectType;

  // メンバー情報（複数ソースから統合）
  members: {
    userId: string;
    name: string;
    email: string;
    role: string;
    availability: MemberAvailability;  // Phase 4
  }[];

  // タスク（GitHub Issuesと同期）
  tasks: {
    actionItem: ActionItem;
    githubIssue?: GitHubIssue;         // Phase 3
    status: TaskStatus;
  }[];

  // 会計情報
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
    transactions: Transaction[];        // Phase 5
  };

  // 会議履歴
  meetings: {
    minutes: MeetingMinutes;
    notionUrl: string;
    slackThreadUrl?: string;           // Phase 6
  }[];

  // Notion/Slack連携
  notionDatabaseId: string;
  slackChannelId: string;
}
```

---

## 📊 実装優先度マトリクス

| フェーズ | 機能 | 優先度 | 実装難易度 | ビジネス価値 | 推定工数 |
|:--------|:-----|:------:|:----------:|:----------:|:--------:|
| Phase 3.1 | GitHub Issues連携 | 高 | 中 | 高 | 2週間 |
| Phase 3.2 | タスク自動化 | 中 | 高 | 中 | 3週間 |
| Phase 4.1 | メンバー管理統合 | 高 | 中 | 高 | 2週間 |
| Phase 4.2 | AI日程調整 | 高 | 高 | 極高 | 4週間 |
| Phase 5.1 | 決済連携 | 中 | 中 | 高 | 3週間 |
| Phase 5.2 | AI会計処理 | 高 | 高 | 極高 | 5週間 |
| Phase 5.3 | 会計可視化 | 中 | 低 | 中 | 1週間 |
| Phase 6.1 | 議事録Slack共有 | 高 | 低 | 中 | 1週間 |
| Phase 6.2 | Slack要約 | 中 | 中 | 中 | 2週間 |
| Phase 6.3 | Slackボット拡張 | 低 | 中 | 低 | 3週間 |
| **Phase 7.1** | **スマートコントラクト開発** | **中** | **極高** | **高** | **6週間** |
| **Phase 7.2** | **AI貢献度評価** | **中** | **高** | **高** | **4週間** |
| **Phase 7.3** | **トークン配布自動化** | **中** | **高** | **中** | **3週間** |
| **Phase 7.4** | **DAO ガバナンス** | **低** | **極高** | **中** | **5週間** |

---

## 🚀 推奨実装順序

### Step 1: タスク管理基盤（Phase 3）
1. GitHub Issues連携
2. 基本的なタスク自動化

**理由**: 議事録機能が既にあるため、次のステップとして自然。即座に生産性向上。

---

### Step 2: Slack基本連携（Phase 6.1）
1. 議事録の自動Slack投稿
2. メンション機能

**理由**: 実装が比較的簡単で、チーム全体の情報共有を改善。

---

### Step 3: スケジュール調整（Phase 4）
1. メンバー情報統合
2. AI日程調整エンジン

**理由**: NPO運営で最も時間がかかる作業の一つ。大きな時間削減効果。

---

### Step 4: 会計自動化（Phase 5）
1. Stripe/GMO連携
2. AI仕訳エンジン
3. freee連携

**理由**: 最も複雑だが、最も価値が高い。前のフェーズで基盤が整ってから。

---

### Step 5: 高度機能（Phase 3.2, 6.2, 6.3）
1. タスク自動実行
2. Slack会話要約
3. ボットコマンド拡張

**理由**: 必須ではないが、あると便利な機能。余裕があれば実装。

---

## 🔐 セキュリティ・権限管理

### API Key管理
```bash
# 追加が必要な環境変数

# GitHub
GITHUB_TOKEN=ghp_xxxxx
GITHUB_OWNER=your-org
GITHUB_REPO=your-repo

# Google Sheets
GOOGLE_SHEETS_SPREADSHEET_ID=xxxxx

# Stripe
STRIPE_API_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx

# GMO
GMO_SHOP_ID=xxxxx
GMO_SHOP_PASSWORD=xxxxx
GMO_SITE_ID=xxxxx
GMO_SITE_PASS=xxxxx

# freee
FREEE_CLIENT_ID=xxxxx
FREEE_CLIENT_SECRET=xxxxx
FREEE_COMPANY_ID=xxxxx

# Slack
SLACK_BOT_TOKEN=xoxb-xxxxx
SLACK_APP_TOKEN=xapp-xxxxx
SLACK_SIGNING_SECRET=xxxxx
```

### 権限レベル
- **管理者**: 全機能アクセス、会計データ閲覧
- **メンバー**: タスク管理、スケジュール確認
- **ゲスト**: 議事録閲覧のみ

---

## 💡 技術スタック推奨

### 新規導入が必要なもの
- **GitHub Octokit**: GitHub API連携
- **Google Sheets API**: スプレッドシート操作
- **Stripe SDK**: 決済データ取得
- **GMO Payment SDK**: GMO連携
- **freee API SDK**: 会計ソフト連携
- **Slack Bolt**: Slackボット開発フレームワーク
- **BullMQ / Agenda**: ジョブキュー（自動化処理用）

---

## 📝 次のステップ

1. **詳細設計ドキュメント作成** (Phase 3.1から開始)
2. **プロトタイプ開発** (GitHub Issues連携)
3. **ユーザーフィードバック収集**
4. **段階的なロールアウト**

---

## 🎓 学習リソース

### API ドキュメント
- [GitHub REST API](https://docs.github.com/en/rest)
- [Google Calendar API](https://developers.google.com/calendar)
- [Google Sheets API](https://developers.google.com/sheets)
- [Stripe API](https://stripe.com/docs/api)
- [GMO Payment Gateway API](https://docs.mul-pay.jp/)
- [freee API](https://developer.freee.co.jp/)
- [Slack API](https://api.slack.com/)

### 参考実装
- [Slack Bolt Examples](https://github.com/slackapi/bolt-js)
- [Stripe Samples](https://github.com/stripe-samples)
- [Octokit Examples](https://github.com/octokit/octokit.js)

---

このロードマップに基づいて、段階的に機能を実装していくことで、AIMeetをNPO運営の強力なパートナーに進化させることができます！
