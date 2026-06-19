import { useQuery } from '@tanstack/react-query'
import type { Label } from '../types'
import { queryClient } from '../lib/queryClient'

export function useLabels(teamId?: string) {
  return useQuery({
    queryKey: ['labels', teamId],
    queryFn: async () => {
      const url = teamId ? `/api/labels?teamId=${teamId}` : '/api/labels'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch labels')
      return res.json() as Promise<Label[]>
    },
  })
}

export async function createLabel(data: Omit<Label, 'id' | 'createdAt' | 'isSystem'> & { isSystem?: boolean }) {
  const res = await fetch('/api/labels', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create label')
  const result = await res.json()
  queryClient.invalidateQueries({ queryKey: ['labels'] })
  return result
}

export async function deleteLabel(id: string) {
  const res = await fetch(`/api/labels?id=${id}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error('Failed to delete label')
  queryClient.invalidateQueries({ queryKey: ['labels'] })
}
