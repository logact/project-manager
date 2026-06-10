import { NextRequest, NextResponse } from 'next/server'
import { getTeams, createTeam, mapRow } from '@/lib/db'

export async function GET() {
  const rows = await getTeams()
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = { ...body, id: crypto.randomUUID(), createdAt: Date.now() }
  const row = await createTeam(data as { id: string; name: string; key: string; color: string; createdAt: number })
  return NextResponse.json(mapRow(row), { status: 201 })
}
