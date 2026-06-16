import { NextRequest, NextResponse } from 'next/server'
import { getLabels, createLabel, deleteLabel, mapRow } from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const teamId = searchParams.get('teamId') || undefined
  const rows = await getLabels(teamId)
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = {
    id: crypto.randomUUID(),
    name: body.name,
    color: body.color,
    teamId: body.teamId,
    createdAt: Date.now(),
  }
  const row = await createLabel(data)
  return NextResponse.json(mapRow(row), { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }
  await deleteLabel(id)
  return NextResponse.json({ success: true })
}
