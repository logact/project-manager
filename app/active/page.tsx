import AppLayout from '@/components/layout/AppLayout'
import ListView from '@/components/list/ListView'

export default function ActivePage() {
  return (
    <AppLayout>
      <ListView title="Active Issues" activeOnly />
    </AppLayout>
  )
}
