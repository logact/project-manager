import AppLayout from '@/components/layout/AppLayout'
import ListView from '@/components/list/ListView'

export default function ProjectListPage({ params }: { params: Promise<{ projectId: string }> }) {
  return (
    <AppLayout>
      <ListView />
    </AppLayout>
  )
}
