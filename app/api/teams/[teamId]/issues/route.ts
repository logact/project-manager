import { NextResponse } from 'next/server'
import { getIssuesByTeam, mapRow } from '@/lib/db'

export async function GET(_req: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { teamId } = await params
  const rows = await getIssuesByTeam(teamId)
  return NextResponse.json(rows.map(mapRow))
}
