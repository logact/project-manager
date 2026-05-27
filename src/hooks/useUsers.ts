import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/schema'
import { generateId } from '../lib/utils'
import type { User } from '../types'

export function useUsers() {
  return useLiveQuery(() => db.users.toArray(), []) ?? []
}

export function useUser(id: string | undefined) {
  return useLiveQuery(
    () => (id ? db.users.get(id) : undefined),
    [id]
  )
}

export async function createUser(data: Omit<User, 'id' | 'createdAt'>) {
  const user: User = { ...data, id: generateId(), createdAt: Date.now() }
  await db.users.add(user)
  return user
}
