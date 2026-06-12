import { NextRequest, NextResponse } from 'next/server'
import { rebalanceIssueOrders } from '@/lib/db'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const state = body.state
  if (typeof state !== 'string') {
    return NextResponse.json({ error: 'state is required' }, { status: 400 })
  }
  await rebalanceIssueOrders(state, body.teamId)
  return NextResponse.json({ ok: true })
}
