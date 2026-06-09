import AppLayout from '@/components/layout/AppLayout'
import ListView from '@/components/list/ListView'

export default function ListPage() {
  return (
    <AppLayout>
      <ListView title="All Issues" />
    </AppLayout>
  )
}
