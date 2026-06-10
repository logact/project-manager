import { NextRequest, NextResponse } from 'next/server'
import { getProject, updateProject, deleteProject, mapRow } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = await getProject(id)
  if (!row) return NextResponse.json({ error: 'Project not found' }, { status: 404 })
  return NextResponse.json(mapRow(row))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const changes: Record<string, unknown> = { ...body }

  delete changes.id
  delete changes.createdAt

  await updateProject(id, changes as Parameters<typeof updateProject>[1])
  const row = await getProject(id)
  return NextResponse.json(mapRow(row!))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteProject(id)
  return new NextResponse(null, { status: 204 })
}
