import AppLayout from '@/components/layout/AppLayout'
import BoardView from '@/components/board/BoardView'

export default function TeamPage({ params }: { params: Promise<{ teamId: string }> }) {
  return (
    <AppLayout>
      <BoardView />
    </AppLayout>
  )
}
