import { useQuery } from '@tanstack/react-query'
import type { Label } from '../types'
import { API_BASE } from '../config'
import { queryClient } from '../lib/queryClient'

export function useLabels(teamId?: string) {
  return useQuery({
    queryKey: ['labels', teamId],
    queryFn: async () => {
      const url = teamId ? `${API_BASE}/labels?teamId=${teamId}` : `${API_BASE}/labels`
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch labels')
      return res.json() as Promise<Label[]>
    },
  })
}

export async function createLabel(data: Omit<Label, 'id' | 'createdAt'>) {
  const res = await fetch(`${API_BASE}/labels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create label')
  const result = await res.json()
  queryClient.invalidateQueries({ queryKey: ['labels'] })
  return result
}
