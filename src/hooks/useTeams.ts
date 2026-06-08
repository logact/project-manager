import { useQuery } from '@tanstack/react-query'
import type { Team } from '../types'
import { API_BASE } from '../config'
import { queryClient } from '../lib/queryClient'

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/teams`)
      if (!res.ok) throw new Error('Failed to fetch teams')
      return res.json() as Promise<Team[]>
    },
  })
}

export function useTeam(id: string | undefined) {
  return useQuery({
    queryKey: ['team', id],
    queryFn: async () => {
      if (!id) throw new Error('No team id')
      const res = await fetch(`${API_BASE}/teams/${id}`)
      if (!res.ok) throw new Error('Failed to fetch team')
      return res.json() as Promise<Team>
    },
    enabled: !!id,
  })
}

export async function createTeam(data: Omit<Team, 'id' | 'createdAt'>) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create team')
  const result = await res.json()
  queryClient.invalidateQueries({ queryKey: ['teams'] })
  return result
}

export async function deleteTeam(id: string) {
  const res = await fetch(`${API_BASE}/teams/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete team')
  queryClient.invalidateQueries({ queryKey: ['teams'] })
  queryClient.invalidateQueries({ queryKey: ['projects'] })
}
