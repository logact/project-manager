import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { generateId } from '../lib/utils'
import type { Project } from '../types'

export function useProjects(teamId?: string) {
  return useLiveQuery(
    () =>
      teamId
        ? db.projects.where('teamId').equals(teamId).toArray()
        : db.projects.toArray(),
    [teamId]
  ) ?? []
}

export function useProject(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.projects.get(id) : undefined),
    [id]
  )
}

export async function createProject(data: Omit<Project, 'id' | 'createdAt'>) {
  const project: Project = { ...data, id: generateId(), createdAt: Date.now() }
  await db.projects.add(project)
  return project
}

export async function updateProject(id: string, changes: Partial<Project>) {
  await db.projects.update(id, changes)
}
