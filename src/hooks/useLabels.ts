import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { generateId } from '../lib/utils'
import type { Label } from '../types'

export function useLabels(teamId?: string) {
  return useLiveQuery(
    () =>
      teamId
        ? db.labels.where('teamId').equals(teamId).toArray()
        : db.labels.toArray(),
    [teamId]
  ) ?? []
}

export async function createLabel(data: Omit<Label, 'id' | 'createdAt'>) {
  const label: Label = { ...data, id: generateId(), createdAt: Date.now() }
  await db.labels.add(label)
  return label
}
