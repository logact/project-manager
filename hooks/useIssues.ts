import { useQuery } from '@tanstack/react-query'
import type { Issue, IssueState } from '../types'
import { queryClient } from '../lib/queryClient'

const IMAGE_REGEX = /!\[([^\]]*)\]\(data:image\/(png|jpeg|gif|webp|svg\+xml);base64,([A-Za-z0-9+/=]+)\)/g

async function extractAndUploadImages(markdown: string): Promise<string> {
  const matches = Array.from(markdown.matchAll(IMAGE_REGEX))
  if (matches.length === 0) return markdown

  let result = markdown
  for (const match of matches) {
    const [fullMatch, alt, ext, data] = match
    const mime = `image/${ext === 'svg+xml' ? 'svg+xml' : ext}`
    const binary = atob(data)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)

    const blob = new Blob([bytes], { type: mime })
    const formData = new FormData()
    formData.append('file', blob, `image.${ext === 'svg+xml' ? 'svg' : ext}`)

    try {
      const res = await fetch('/api/images/upload', { method: 'POST', body: formData })
      if (res.ok) {
        const { url } = await res.json()
        result = result.replace(fullMatch, `![${alt}](${url})`)
      }
    } catch {
      // Keep original base64 if upload fails
    }
  }
  return result
}

export function useIssues(filters?: { teamId?: string; state?: IssueState; projectId?: string; assigneeId?: string; archived?: boolean }) {
  return useQuery({
    queryKey: ['issues', filters],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (filters?.teamId) params.set('teamId', filters.teamId)
      if (filters?.state) params.set('state', filters.state)
      if (filters?.projectId) params.set('projectId', filters.projectId)
      if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId)
      if (filters?.archived !== undefined) params.set('archived', String(filters.archived))

      const url = `/api/issues${params.toString() ? '?' + params.toString() : ''}`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch issues')
      return res.json() as Promise<Issue[]>
    },
  })
}

export function useIssue(id: string | undefined) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: async () => {
      if (!id) throw new Error('No issue id')
      const res = await fetch(`/api/issues/${id}`)
      if (!res.ok) throw new Error('Failed to fetch issue')
      return res.json() as Promise<Issue>
    },
    enabled: !!id,
  })
}

export function useIssuesByTeam(teamId: string) {
  return useQuery({
    queryKey: ['issues', 'team', teamId],
    queryFn: async () => {
      if (!teamId) throw new Error('No team id')
      const res = await fetch(`/api/teams/${teamId}/issues`)
      if (!res.ok) throw new Error('Failed to fetch issues')
      return res.json() as Promise<Issue[]>
    },
    enabled: !!teamId,
  })
}

export async function createIssue(data: Omit<Issue, 'id' | 'identifier' | 'createdAt' | 'updatedAt' | 'order' | 'archived' | 'archivedAt'> & { order?: number }) {
  const description = data.description ? await extractAndUploadImages(data.description) : data.description
  const res = await fetch('/api/issues', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...data, description }),
  })
  if (!res.ok) throw new Error('Failed to create issue')
  const result = await res.json()
  queryClient.invalidateQueries({ queryKey: ['issues'] })
  return result
}

export async function updateIssue(id: string, changes: Partial<Issue>) {
  const description = changes.description ? await extractAndUploadImages(changes.description) : changes.description
  const res = await fetch(`/api/issues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...changes, description }),
  })
  if (!res.ok) throw new Error('Failed to update issue')
  queryClient.invalidateQueries({ queryKey: ['issues'] })
  queryClient.invalidateQueries({ queryKey: ['issue', id] })
}

export async function deleteIssue(id: string) {
  const res = await fetch(`/api/issues/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete issue')
  queryClient.invalidateQueries({ queryKey: ['issues'] })
}

export async function archiveIssue(id: string) {
  const res = await fetch(`/api/issues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'archive' }),
  })
  if (!res.ok) throw new Error('Failed to archive issue')
  queryClient.invalidateQueries({ queryKey: ['issues'] })
}

export async function unarchiveIssue(id: string) {
  const res = await fetch(`/api/issues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'unarchive' }),
  })
  if (!res.ok) throw new Error('Failed to unarchive issue')
  queryClient.invalidateQueries({ queryKey: ['issues'] })
}

export async function reorderIssue(
  issue: Issue,
  newState: IssueState,
  targetIndex: number,
  issuesInTargetColumn: Issue[]
) {
  const siblings = issuesInTargetColumn
    .filter((i) => i.id !== issue.id)
    .sort((a, b) => a.order - b.order)

  const originalIndex = issuesInTargetColumn.findIndex((i) => i.id === issue.id)
  let insertIndex = targetIndex
  if (originalIndex !== -1 && targetIndex > originalIndex) {
    insertIndex--
  }

  let newOrder: number
  if (siblings.length === 0) {
    newOrder = Date.now()
  } else if (insertIndex <= 0) {
    newOrder = siblings[0].order - 1024
  } else if (insertIndex >= siblings.length) {
    newOrder = siblings[siblings.length - 1].order + 1024
  } else {
    const prev = siblings[insertIndex - 1]
    const next = siblings[insertIndex]
    if (next.order - prev.order <= 1) {
      await fetch('/api/issues/rebalance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state: newState, teamId: issue.teamId }),
      })
      newOrder = insertIndex * 1024 + 512
    } else {
      newOrder = Math.floor((prev.order + next.order) / 2)
    }
  }

  await updateIssue(issue.id, { state: newState, order: newOrder })
}
