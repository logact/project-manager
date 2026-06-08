import { useEffect, useState } from 'react'
import type { Team } from '../types'
import { API_BASE } from '../config'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])

  useEffect(() => {
    const fetchTeams = async () => {
      const res = await fetch(`${API_BASE}/teams`)
      if (res.ok) {
        const data = await res.json()
        setTeams(data)
      }
    }
    fetchTeams()
    const interval = setInterval(fetchTeams, 2000)
    return () => clearInterval(interval)
  }, [])

  return teams
}

export function useTeam(id: string | undefined) {
  const [team, setTeam] = useState<Team | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    const fetchTeam = async () => {
      const res = await fetch(`${API_BASE}/teams/${id}`)
      if (res.ok) {
        const data = await res.json()
        setTeam(data)
      }
    }
    fetchTeam()
    const interval = setInterval(fetchTeam, 2000)
    return () => clearInterval(interval)
  }, [id])

  return team
}

export async function createTeam(data: Omit<Team, 'id' | 'createdAt'>) {
  const res = await fetch(`${API_BASE}/teams`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create team')
  return res.json()
}

export async function deleteTeam(id: string) {
  const res = await fetch(`${API_BASE}/teams/${id}`, { method: 'DELETE' })
  if (!res.ok) throw new Error('Failed to delete team')
}
