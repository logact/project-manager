import AppLayout from '@/components/layout/AppLayout'
import ListView from '@/components/list/ListView'

export default function TeamListPage({ params }: { params: Promise<{ teamId: string }> }) {
  return (
    <AppLayout>
      <ListView />
    </AppLayout>
  )
}
