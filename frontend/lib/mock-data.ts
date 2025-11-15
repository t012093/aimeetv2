export type ProjectType = 'international' | 'programming' | 'art' | 'interview' | 'default'

export interface Project {
  id: ProjectType
  name: string
  icon: string
  color: string
  description: string
  meetingsThisMonth: number
  incompleteTasks: number
}

export interface Meeting {
  id: string
  title: string
  date: string
  projectType: ProjectType
  participants: string[]
  status: 'recording' | 'processing' | 'completed' | 'failed'
  duration?: string
}

export const projects: Project[] = [
  {
    id: 'international',
    name: '国際交流',
    icon: '🌍',
    color: 'bg-blue-500',
    description: '国際交流・異文化理解プログラム',
    meetingsThisMonth: 8,
    incompleteTasks: 3,
  },
  {
    id: 'programming',
    name: 'プログラミング教室',
    icon: '💻',
    color: 'bg-purple-500',
    description: '子供向けプログラミング教室',
    meetingsThisMonth: 12,
    incompleteTasks: 5,
  },
  {
    id: 'art',
    name: 'アート支援',
    icon: '🎨',
    color: 'bg-pink-500',
    description: 'アート・文化支援活動',
    meetingsThisMonth: 6,
    incompleteTasks: 2,
  },
  {
    id: 'interview',
    name: '面接',
    icon: '💼',
    color: 'bg-orange-500',
    description: '採用・面接プロセス',
    meetingsThisMonth: 4,
    incompleteTasks: 1,
  },
  {
    id: 'default',
    name: 'デフォルト',
    icon: '📋',
    color: 'bg-gray-500',
    description: '一般的な会議',
    meetingsThisMonth: 5,
    incompleteTasks: 2,
  },
]

export const recentMeetings: Meeting[] = [
  {
    id: '1',
    title: '国際交流プログラム定例会議',
    date: '2025-11-14T15:00:00',
    projectType: 'international',
    participants: ['田中太郎', '佐藤花子', 'John Smith'],
    status: 'completed',
    duration: '45分',
  },
  {
    id: '2',
    title: 'プログラミング教室カリキュラム検討',
    date: '2025-11-13T10:30:00',
    projectType: 'programming',
    participants: ['山田次郎', '鈴木一郎', '高橋美咲'],
    status: 'completed',
    duration: '1時間20分',
  },
  {
    id: '3',
    title: 'アート展示企画ミーティング',
    date: '2025-11-12T14:00:00',
    projectType: 'art',
    participants: ['伊藤優子', '渡辺健太'],
    status: 'processing',
  },
  {
    id: '4',
    title: 'ボランティアスタッフ面接',
    date: '2025-11-11T16:00:00',
    projectType: 'interview',
    participants: ['中村部長', '小林課長'],
    status: 'completed',
    duration: '30分',
  },
  {
    id: '5',
    title: '全体定例会議',
    date: '2025-11-10T09:00:00',
    projectType: 'default',
    participants: ['全スタッフ'],
    status: 'completed',
    duration: '2時間',
  },
  {
    id: '6',
    title: '国際交流イベント振り返り',
    date: '2025-11-09T13:00:00',
    projectType: 'international',
    participants: ['田中太郎', 'Emily Johnson'],
    status: 'failed',
  },
]

export const stats = {
  totalMeetings: 35,
  totalRecordingHours: 42.5,
  generatedMinutes: 32,
  thisMonthMeetings: 14,
}
