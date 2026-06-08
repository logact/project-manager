import { useEffect, useState } from 'react'
import type { Project } from '../types'
import { API_BASE } from '../config'

export function useProjects(teamId?: string) {
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    const fetchProjects = async () => {
      const url = teamId ? `${API_BASE}/projects?teamId=${teamId}` : `${API_BASE}/projects`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setProjects(data)
      }
    }
    fetchProjects()
    const interval = setInterval(fetchProjects, 2000)
    return () => clearInterval(interval)
  }, [teamId])

  return projects
}

export function useProject(id: string | undefined) {
  const [project, setProject] = useState<Project | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    const fetchProject = async () => {
      const res = await fetch(`${API_BASE}/projects/${id}`)
      if (res.ok) {
        const data = await res.json()
        setProject(data)
      }
    }
    fetchProject()
    const interval = setInterval(fetchProject, 2000)
    return () => clearInterval(interval)
  }, [id])

  return project
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt'>) {
  const res = await fetch(`${API_BASE}/projects`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create project')
  return res.json()
}

export async function updateProject(id: string, changes: Partial<Project>) {
  const res = await fetch(`${API_BASE}/projects/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
  if (!res.ok) throw new Error('Failed to update project')
}
