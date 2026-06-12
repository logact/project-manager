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
  const rows = await getIssues(filters)
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const teamId = body.teamId
  const identifier = await getNextIdentifier(teamId)
  const now = Date.now()
  const data = {
    id: crypto.randomUUID(),
    identifier,
    title: body.title,
    description: body.description || null,
    state: body.state || 'backlog',
    priority: body.priority || 'no_priority',
    labelIds: JSON.stringify(body.labelIds || []),
    teamId,
    assigneeId: body.assigneeId || null,
    projectId: body.projectId || null,
    cycleId: body.cycleId || null,
    order: typeof body.order === 'number' ? body.order : now,
    createdAt: now,
    updatedAt: now,
  }
  const row = await createIssue(data)
  return NextResponse.json(mapRow(row), { status: 201 })
}
