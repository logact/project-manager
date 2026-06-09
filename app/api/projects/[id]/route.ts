import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, deleteProject, mapRow } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = getProject(id)
  if (!row) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  return NextResponse.json(mapRow(row))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const changes: Record<string, unknown> = { ...body }

  if (changes.teamId !== undefined) { changes.team_id = changes.teamId; delete changes.teamId }
  if (changes.startDate !== undefined) { changes.start_date = changes.startDate; delete changes.startDate }
  if (changes.targetDate !== undefined) { changes.target_date = changes.targetDate; delete changes.targetDate }

  delete changes.id
  delete changes.createdAt

  updateProject(id, changes)
  const row = getProject(id)
  return NextResponse.json(mapRow(row))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  deleteProject(id)
  return new NextResponse(null, { status: 204 })
}
