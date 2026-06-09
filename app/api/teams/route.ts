import { NextRequest, NextResponse } from 'next/server'
import { getTeams, createTeam, mapRow } from '@/lib/db'

export async function GET() {
  const rows = getTeams()
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = { ...body, id: crypto.randomUUID(), created_at: Date.now() }
  createTeam(data as { id: string; name: string; key: string; color: string; created_at: number })
  return NextResponse.json(mapRow(data), { status: 201 })
}
