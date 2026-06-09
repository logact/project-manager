import { NextRequest, NextResponse } from 'next/server'
import { getProjects, createProject, mapRow } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId') || undefined
  const rows = getProjects(teamId)
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = {
    ...body,
    id: crypto.randomUUID(),
    team_id: body.teamId,
    start_date: body.startDate || null,
    target_date: body.targetDate || null,
    created_at: Date.now(),
  }
  delete (data as Record<string, unknown>).teamId
  delete (data as Record<string, unknown>).startDate
  delete (data as Record<string, unknown>).targetDate
  createProject(data)
  return NextResponse.json(mapRow(data), { status: 201 })
}
