import AppLayout from '@/components/layout/AppLayout'
import BoardView from '@/components/board/BoardView'

export default function ProjectBoardPage({ params }: { params: Promise<{ projectId: string }> }) {
  return (
    <AppLayout>
      <BoardView />
    </AppLayout>
  )
}
