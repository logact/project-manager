'use client'

import { useRouter, useParams } from 'next/navigation'
import AppLayout from '@/components/layout/AppLayout'
import IssueForm from '@/components/issue/IssueForm'

export default function IssuePage() {
  const router = useRouter()
  const params = useParams()
  const issueId = params.issueId as string

  return (
    <AppLayout>
      <IssueForm
        issueId={issueId}
        onNavigateBack={() => router.back()}
        onDeleted={() => router.push('/board')}
      />
    </AppLayout>
  )
}
