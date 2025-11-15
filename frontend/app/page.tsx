import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { projects, recentMeetings, stats } from '@/lib/mock-data'

export default function Dashboard() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">ダッシュボード</h1>
          <p className="text-muted-foreground mt-2">
            NPO運営を革新する、AI駆動の会議自動化システム
          </p>
        </div>
        <Link href="/record" className="mt-4 md:mt-0">
          <Button size="lg" className="w-full md:w-auto">
            🎤 新しい会議を記録
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>今月の会議</CardDescription>
            <CardTitle className="text-3xl">{stats.thisMonthMeetings}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              総会議数: {stats.totalMeetings}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総録音時間</CardDescription>
            <CardTitle className="text-3xl">{stats.totalRecordingHours}h</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              平均: {(stats.totalRecordingHours / stats.totalMeetings).toFixed(1)}h/会議
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>生成された議事録</CardDescription>
            <CardTitle className="text-3xl">{stats.generatedMinutes}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              成功率: {((stats.generatedMinutes / stats.totalMeetings) * 100).toFixed(0)}%
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>アクティブプロジェクト</CardDescription>
            <CardTitle className="text-3xl">{projects.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              未完了タスク: {projects.reduce((sum, p) => sum + p.incompleteTasks, 0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">プロジェクト概要</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
            >
              <CardHeader>
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{project.icon}</span>
                  <div className="flex-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="mt-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">今月の会議:</span>
                    <span className="font-semibold">{project.meetingsThisMonth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">未完了タスク:</span>
                    <span className="font-semibold">{project.incompleteTasks}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Meetings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">最近の会議</h2>
          <Link href="/meetings">
            <Button variant="outline">すべて見る</Button>
          </Link>
        </div>
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {recentMeetings.map((meeting) => {
                const project = projects.find((p) => p.id === meeting.projectType)
                return (
                  <div
                    key={meeting.id}
                    className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{project?.icon}</span>
                        <div>
                          <h3 className="font-semibold">{meeting.title}</h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1">
                            <Badge variant="outline" className={project?.color}>
                              {project?.name}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(meeting.date).toLocaleDateString('ja-JP', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                            {meeting.duration && (
                              <span className="text-sm text-muted-foreground">
                                • {meeting.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            参加者: {meeting.participants.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Badge
                          variant={
                            meeting.status === 'completed'
                              ? 'default'
                              : meeting.status === 'failed'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {meeting.status === 'completed'
                            ? '✅ 完了'
                            : meeting.status === 'recording'
                            ? '🔴 録音中'
                            : meeting.status === 'processing'
                            ? '⚙️ 処理中'
                            : '❌ 失敗'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
