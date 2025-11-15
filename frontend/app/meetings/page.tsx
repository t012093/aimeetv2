import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function MeetingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">議事録一覧</h1>
          <p className="text-muted-foreground mt-2">
            すべての会議と議事録を管理
          </p>
        </div>
        <Link href="/record">
          <Button>新しい会議を記録</Button>
        </Link>
      </div>

      <div className="flex items-center justify-center h-64 border-2 border-dashed rounded-lg">
        <div className="text-center">
          <p className="text-xl font-semibold mb-2">🚧 実装予定</p>
          <p className="text-muted-foreground">
            議事録一覧機能は近日公開予定です
          </p>
        </div>
      </div>
    </div>
  )
}
