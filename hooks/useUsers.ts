import { useQuery } from '@tanstack/react-query'
import type { User } from '../types'
import { queryClient } from '../lib/queryClient'

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await fetch('/api/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json() as Promise<User[]>
    },
  })
}

export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) throw new Error('No user id')
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error('Failed to fetch user')
      return res.json() as Promise<User>
    },
    enabled: !!id,
  })
}

export async function createUser(data: Omit<User, 'id' | 'createdAt'>) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create user')
  const result = await res.json()
  queryClient.invalidateQueries({ queryKey: ['users'] })
  return result
}
