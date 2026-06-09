import { NextRequest, NextResponse } from 'next/server'
import { getIssues, createIssue, getNextIdentifier, mapRow } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const filters = {
    teamId: searchParams.get('teamId') || undefined,
    state: searchParams.get('state') || undefined,
    projectId: searchParams.get('projectId') || undefined,
    assigneeId: searchParams.get('assigneeId') || undefined,
  }
  const rows = getIssues(filters)
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const teamId = body.teamId
  const identifier = getNextIdentifier(teamId)
  const now = Date.now()
  const data = {
    ...body,
    id: crypto.randomUUID(),
    identifier,
    label_ids: JSON.stringify(body.labelIds || []),
    team_id: teamId,
    assignee_id: body.assigneeId || null,
    project_id: body.projectId || null,
    cycle_id: body.cycleId || null,
    created_at: now,
    updated_at: now,
  }
  delete (data as Record<string, unknown>).teamId
  delete (data as Record<string, unknown>).labelIds
  delete (data as Record<string, unknown>).assigneeId
  delete (data as Record<string, unknown>).projectId
  delete (data as Record<string, unknown>).cycleId
  createIssue(data)
  return NextResponse.json(mapRow(data), { status: 201 })
}
