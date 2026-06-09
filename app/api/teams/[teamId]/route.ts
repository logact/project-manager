import { NextResponse } from 'next/server'
import { getTeam, deleteTeam, mapRow } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const row = getTeam(teamId)
  if (!row) return NextResponse.json({ error: 'Team not found' }, { status: 404 })
  return NextResponse.json(mapRow(row))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  deleteTeam(teamId)
  return new NextResponse(null, { status: 204 })
}
