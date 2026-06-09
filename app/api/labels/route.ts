import { NextRequest, NextResponse } from 'next/server'
import { getLabels, createLabel, mapRow } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId') || undefined
  const rows = getLabels(teamId)
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = { ...body, id: crypto.randomUUID(), team_id: body.teamId, created_at: Date.now() }
  delete (data as Record<string, unknown>).teamId
  createLabel(data)
  return NextResponse.json(mapRow(data), { status: 201 })
}
