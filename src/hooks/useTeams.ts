import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { generateId } from '../lib/utils'
import type { Team } from '../types'

export function useTeams() {
  return useLiveQuery(() => db.teams.toArray(), []) ?? []
}

export function useTeam(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.teams.get(id) : undefined),
    [id]
  )
}

export async function createTeam(data: Omit<Team, 'id' | 'createdAt'>) {
  const team: Team = { ...data, id: generateId(), createdAt: Date.now() }
  await db.teams.add(team)
  return team
}
