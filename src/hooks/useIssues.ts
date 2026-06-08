import { useEffect, useState, useCallback } from 'react'
import type { Issue, IssueState } from '../types'
import { API_BASE } from '../config'

export function useIssues(filters?: { teamId?: string; state?: IssueState; projectId?: string; assigneeId?: string }) {
  const [issues, setIssues] = useState<Issue[]>([])

  const fetchIssues = useCallback(async () => {
    const params = new URLSearchParams()
    if (filters?.teamId) params.set('teamId', filters.teamId)
    if (filters?.state) params.set('state', filters.state)
    if (filters?.projectId) params.set('projectId', filters.projectId)
    if (filters?.assigneeId) params.set('assigneeId', filters.assigneeId)

    const url = `${API_BASE}/issues${params.toString() ? '?' + params.toString() : ''}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      setIssues(data)
    }
  }, [filters?.teamId, filters?.state, filters?.projectId, filters?.assigneeId])

  useEffect(() => {
    fetchIssues()
    const interval = setInterval(fetchIssues, 2000)
    return () => clearInterval(interval)
  }, [fetchIssues])

  return issues
}

export function useIssue(id: string | undefined) {
  const [issue, setIssue] = useState<Issue | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    const fetchIssue = async () => {
      const res = await fetch(`${API_BASE}/issues/${id}`)
      if (res.ok) {
        const data = await res.json()
        setIssue(data)
      }
    }
    fetchIssue()
    const interval = setInterval(fetchIssue, 2000)
    return () => clearInterval(interval)
  }, [id])

  return issue
}

export function useIssuesByTeam(teamId: string) {
  const [issues, setIssues] = useState<Issue[]>([])

  useEffect(() => {
    const fetchIssues = async () => {
      const res = await fetch(`${API_BASE}/teams/${teamId}/issues`)
      if (res.ok) {
        const data = await res.json()
        setIssues(data)
      }
    }
    fetchIssues()
    const interval = setInterval(fetchIssues, 2000)
    return () => clearInterval(interval)
  }, [teamId])

  return issues
}

export async function createIssue(data: Omit<Issue, 'id' | 'identifier' | 'createdAt' | 'updatedAt'>) {
  const res = await fetch(`${API_BASE}/issues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create issue')
  return res.json()
}

export async function updateIssue(id: string, changes: Partial<Issue>) {
  const res = await fetch(`${API_BASE}/issues/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(changes),
  })
  if (!res.ok) throw new Error('Failed to update issue')
}

export async function deleteIssue(id: string) {
  const res = await fetch(`${API_BASE}/issues/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete issue')
}
