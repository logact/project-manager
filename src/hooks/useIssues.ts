import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { generateId } from '../lib/utils'
import type { Issue, IssueState } from '../types'

export function useIssues(filters?: { teamId?: string; state?: IssueState; projectId?: string; assigneeId?: string }) {
  return useLiveQuery(async () => {
    let collection = db.issues.toCollection()

    if (filters?.teamId) {
      collection = db.issues.where({ teamId: filters.teamId, state: filters.state ?? 'backlog' })
    }
    if (filters?.projectId) {
      collection = db.issues.where('projectId').equals(filters.projectId)
    }
    if (filters?.assigneeId) {
      collection = db.issues.where('assigneeId').equals(filters.assigneeId)
    }
    if (filters?.state && !filters?.teamId) {
      collection = db.issues.where('state').equals(filters.state)
    }

    const results = await collection.toArray()
    return results.sort((a, b) => b.updatedAt - a.updatedAt)
  }, [filters?.teamId, filters?.state, filters?.projectId, filters?.assigneeId]) ?? []
}

export function useIssue(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.issues.get(id) : undefined),
    [id]
  )
}

export function useIssuesByTeam(teamId: string) {
  return useLiveQuery(
    async () => {
      const issues = teamId
        ? await db.issues.where('teamId').equals(teamId).toArray()
        : await db.issues.toArray()
      return issues.sort((a, b) => getPriorityIndex(b.priority) - getPriorityIndex(a.priority) || b.updatedAt - a.updatedAt)
    },
    [teamId]
  ) ?? []
}

export async function getNextIdentifier(teamId: string): Promise<string> {
  const team = await db.teams.get(teamId)
  if (!team) throw new Error('Team not found')

  const issues = await db.issues.where('teamId').equals(teamId).toArray()
  const numbers = issues
    .map((i) => parseInt(i.identifier.split('-')[1] || '0'))
    .filter((n) => !isNaN(n))
  const max = numbers.length > 0 ? Math.max(...numbers) : 0

  return `${team.key}-${max + 1}`
}

export async function createIssue(data: Omit<Issue, 'id' | 'identifier' | 'createdAt' | 'updatedAt'>) {
  const identifier = await getNextIdentifier(data.teamId)
  const now = Date.now()
  const issue: Issue = {
    ...data,
    id: generateId(),
    identifier,
    createdAt: now,
    updatedAt: now,
  }
  await db.issues.add(issue)
  return issue
}

export async function updateIssue(id: string, changes: Partial<Issue>) {
  await db.issues.update(id, { ...changes, updatedAt: Date.now() })
}

export async function deleteIssue(id: string) {
  await db.issues.delete(id)
  await db.issueHistory.where('issueId').equals(id).delete()
}

function getPriorityIndex(priority: string): number {
  const order = ['no_priority', 'low', 'medium', 'high', 'urgent']
  return order.indexOf(priority)
}
