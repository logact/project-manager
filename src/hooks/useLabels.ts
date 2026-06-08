import { useEffect, useState } from 'react'
import type { Label } from '../types'
import { API_BASE } from '../config'

export function useLabels(teamId?: string) {
  const [labels, setLabels] = useState<Label[]>([])

  useEffect(() => {
    const fetchLabels = async () => {
      const url = teamId ? `${API_BASE}/labels?teamId=${teamId}` : `${API_BASE}/labels`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setLabels(data)
      }
    }
    fetchLabels()
    const interval = setInterval(fetchLabels, 2000)
    return () => clearInterval(interval)
  }, [teamId])

  return labels
}

export async function createLabel(data: Omit<Label, 'id' | 'createdAt'>) {
  const res = await fetch(`${API_BASE}/labels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create label')
  return res.json()
}
