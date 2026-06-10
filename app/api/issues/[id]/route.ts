import { NextRequest, NextResponse } from 'next/server'
import { getIssue, getIssueByIdentifier, updateIssue, deleteIssue, mapRow } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = (await getIssue(id)) || (await getIssueByIdentifier(id))
  if (!row) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
  return NextResponse.json(mapRow(row))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const changes: Record<string, unknown> = { ...body, updatedAt: Date.now() }

  if (changes.labelIds !== undefined) {
    changes.labelIds = JSON.stringify(changes.labelIds)
  }

  delete changes.id
  delete changes.identifier
  delete changes.createdAt

  await updateIssue(id, changes as Parameters<typeof updateIssue>[1])
  const row = await getIssue(id)
  return NextResponse.json(mapRow(row!))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await deleteIssue(id)
  return new NextResponse(null, { status: 204 })
}
