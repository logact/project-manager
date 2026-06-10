import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject, mapRow } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId') || undefined
  const rows = await getProjects(teamId)
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = {
    id: crypto.randomUUID(),
    name: body.name,
    description: body.description || null,
    teamId: body.teamId,
    state: body.state,
    startDate: body.startDate || null,
    targetDate: body.targetDate || null,
    createdAt: Date.now(),
  }
  const row = await createProject(data)
  return NextResponse.json(mapRow(row), { status: 201 })
}
