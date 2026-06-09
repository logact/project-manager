import { NextRequest, NextResponse } from 'next/server'
import { getUsers, createUser, mapRow } from '@/lib/db'

export async function GET() {
  const rows = getUsers()
  return NextResponse.json(rows.map(mapRow))
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const data = { ...body, id: crypto.randomUUID(), avatar_url: body.avatarUrl || null, created_at: Date.now() }
  delete (data as Record<string, unknown>).avatarUrl
  createUser(data)
  return NextResponse.json(mapRow(data), { status: 201 })
}
