import { useEffect, useState } from 'react'
import type { User } from '../types'
import { API_BASE } from '../config'

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])

  useEffect(() => {
    const fetchUsers = async () => {
      const res = await fetch(`${API_BASE}/users`)
      if (res.ok) {
        const data = await res.json()
        setUsers(data)
      }
    }
    fetchUsers()
    const interval = setInterval(fetchUsers, 2000)
    return () => clearInterval(interval)
  }, [])

  return users
}

export function useUser(id: string | undefined) {
  const [user, setUser] = useState<User | undefined>(undefined)

  useEffect(() => {
    if (!id) return
    const fetchUser = async () => {
      const res = await fetch(`${API_BASE}/users/${id}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      }
    }
    fetchUser()
    const interval = setInterval(fetchUser, 2000)
    return () => clearInterval(interval)
  }, [id])

  return user
}

export async function createUser(data: Omit<User, 'id' | 'createdAt'>) {
  const res = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create user')
  return res.json()
}
