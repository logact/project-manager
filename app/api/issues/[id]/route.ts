import { NextRequest, NextResponse } from 'next/server'
import { getIssue, getIssueByIdentifier, updateIssue, deleteIssue, mapRow } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const row = getIssue(id) || getIssueByIdentifier(id)
  if (!row) return NextResponse.json({ error: 'Issue not found' }, { status: 404 })
  return NextResponse.json(mapRow(row))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const changes: Record<string, unknown> = { ...body, updated_at: Date.now() }

  if (changes.labelIds !== undefined) {
    changes.label_ids = JSON.stringify(changes.labelIds)
    delete changes.labelIds
  }
  if (changes.assigneeId !== undefined) { changes.assignee_id = changes.assigneeId; delete changes.assigneeId }
  if (changes.projectId !== undefined) { changes.project_id = changes.projectId; delete changes.projectId }
  if (changes.cycleId !== undefined) { changes.cycle_id = changes.cycleId; delete changes.cycleId }
  if (changes.teamId !== undefined) { changes.team_id = changes.teamId; delete changes.teamId }

  delete changes.id
  delete changes.identifier
  delete changes.createdAt

  updateIssue(id, changes)
  const row = getIssue(id)
  return NextResponse.json(mapRow(row))
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  deleteIssue(id)
  return new NextResponse(null, { status: 204 })
}
