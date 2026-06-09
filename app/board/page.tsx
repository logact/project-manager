import AppLayout from '@/components/layout/AppLayout'
import BoardView from '@/components/board/BoardView'

export default function BoardPage() {
  return (
    <AppLayout>
      <BoardView title="All Issues" />
    </AppLayout>
  )
}
