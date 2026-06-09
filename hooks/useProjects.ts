import { useQuery } from '@tanstack/react-query'
import type { Project } from '../types'
import { queryClient } from '../lib/queryClient'

export function useProjects(teamId?: string) {
  return useQuery({
    queryKey: ['projects', teamId],
    queryFn: async () => {
      const url = teamId ? `/api/projects?teamId=${teamId}` : '/api/projects'
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to fetch projects')
      return res.json() as Promise<Project[]>
    },
  })
}

export function useProject(id: string | undefined) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('No project id')
      const res = await fetch(`/api/projects/${id}`)
      if (!res.ok) throw new Error('Failed to fetch project')
      return res.json() as Promise<Project>
    },
    enabled: !!id,
  })
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt'>) {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create project')
  const result = await res.json()
  queryClient.invalidateQueries({ queryKey: ['projects'] })
  return result
}

export async function updateProject(id: string, changes: Partial<Project>) {
  const res = await fetch(`/api/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
  if (!res.ok) throw new Error('Failed to update project')
  queryClient.invalidateQueries({ queryKey: ['projects'] })
  queryClient.invalidateQueries({ queryKey: ['project', id] })
}

export async function deleteProject(id: string) {
  const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete project')
  queryClient.invalidateQueries({ queryKey: ['projects'] })
}
