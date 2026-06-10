import { NextRequest, NextResponse } from 'next/server'
import { getUsers, createUser, mapRow } from '@/lib/db'

export async function GET() {
  const rows = await getUsers()
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = {
    id: crypto.randomUUID(),
    name: body.name,
    email: body.email,
    avatarUrl: body.avatarUrl || null,
    createdAt: Date.now(),
  }
  const row = await createUser(data)
  return NextResponse.json(mapRow(row), { status: 201 })
}
