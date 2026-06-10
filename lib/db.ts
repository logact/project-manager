import { PrismaClient } from '@prisma/client'
import path from 'path'
import fs from 'fs'

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

process.env.DATABASE_URL ||= `file:${path.join(DATA_DIR, 'project-manager.db')}`

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }
export const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Stubs preserved for backward-compatible imports
export function initDb() {}
export function seedDb() {}

export interface IssueFilters {
  teamId?: string
  state?: string
  projectId?: string
  assigneeId?: string
}

export function getTeams() {
  return prisma.team.findMany({ orderBy: { createdAt: 'asc' } })
}

export function getTeam(id: string) {
  return prisma.team.findUnique({ where: { id } })
}

export function createTeam(data: { id: string; name: string; key: string; color: string; createdAt: number }) {
  return prisma.team.create({ data })
}

export async function deleteTeam(id: string) {
  const teamIssues = await prisma.issue.findMany({ where: { teamId: id }, select: { id: true } })
  const issueIds = teamIssues.map((i) => i.id)
  await prisma.$transaction([
    prisma.issueHistory.deleteMany({ where: { issueId: { in: issueIds } } }),
    prisma.issue.deleteMany({ where: { teamId: id } }),
    prisma.label.deleteMany({ where: { teamId: id } }),
    prisma.cycle.deleteMany({ where: { teamId: id } }),
    prisma.project.deleteMany({ where: { teamId: id } }),
    prisma.team.delete({ where: { id } }),
  ])
}

export function getProjects(teamId?: string) {
  return prisma.project.findMany({
    where: teamId ? { teamId } : undefined,
    orderBy: { createdAt: 'asc' },
  })
}

export function getProject(id: string) {
  return prisma.project.findUnique({ where: { id } })
}

export function createProject(data: {
  id: string
  name: string
  description?: string | null
  teamId: string
  state: string
  startDate?: number | null
  targetDate?: number | null
  createdAt: number
}) {
  return prisma.project.create({ data })
}

export function updateProject(
  id: string,
  changes: Partial<{
    name: string
    description: string | null
    teamId: string
    state: string
    startDate: number | null
    targetDate: number | null
  }>
) {
  return prisma.project.update({ where: { id }, data: changes })
}

export function getUsers() {
  return prisma.user.findMany({ orderBy: { createdAt: 'asc' } })
}

export function getUser(id: string) {
  return prisma.user.findUnique({ where: { id } })
}

export function createUser(data: {
  id: string
  name: string
  email: string
  avatarUrl?: string | null
  createdAt: number
}) {
  return prisma.user.create({ data })
}

export function getLabels(teamId?: string) {
  return prisma.label.findMany({
    where: teamId ? { teamId } : undefined,
    orderBy: { createdAt: 'asc' },
  })
}

export function createLabel(data: { id: string; name: string; color: string; teamId: string; createdAt: number }) {
  return prisma.label.create({ data })
}

export function getIssues(filters?: IssueFilters) {
  return prisma.issue.findMany({
    where: {
      ...(filters?.teamId ? { teamId: filters.teamId } : {}),
      ...(filters?.state ? { state: filters.state } : {}),
      ...(filters?.projectId ? { projectId: filters.projectId } : {}),
      ...(filters?.assigneeId ? { assigneeId: filters.assigneeId } : {}),
    },
    orderBy: { updatedAt: 'desc' },
  })
}

export function getIssue(id: string) {
  return prisma.issue.findUnique({ where: { id } })
}

export function getIssueByIdentifier(identifier: string) {
  return prisma.issue.findUnique({ where: { identifier } })
}

export function getIssuesByTeam(teamId: string) {
  return prisma.issue.findMany({
    where: { teamId },
    orderBy: [{ priority: 'desc' }, { updatedAt: 'desc' }],
  })
}

export async function getNextIdentifier(teamId: string): Promise<string> {
  const result = await prisma.$queryRaw<{ key: string; max_num: number | bigint | null }[]>`
    SELECT t.key, MAX(CAST(SUBSTR(i.identifier, INSTR(i.identifier, '-') + 1) AS INTEGER)) AS max_num
    FROM Team t
    LEFT JOIN Issue i ON i.team_id = t.id
    WHERE t.id = ${teamId}
  `
  const row = result[0]
  if (!row) throw new Error('Team not found')
  const max = typeof row.max_num === 'bigint' ? Number(row.max_num) : (row.max_num ?? 0)
  return `${row.key}-${max + 1}`
}

export function createIssue(data: {
  id: string
  identifier: string
  title: string
  description?: string | null
  state: string
  priority: string
  assigneeId?: string | null
  projectId?: string | null
  cycleId?: string | null
  teamId: string
  labelIds: string
  createdAt: number
  updatedAt: number
}) {
  return prisma.issue.create({ data })
}

export function updateIssue(
  id: string,
  changes: Partial<{
    title: string
    description: string | null
    state: string
    priority: string
    assigneeId: string | null
    projectId: string | null
    cycleId: string | null
    teamId: string
    labelIds: string
    updatedAt: number
  }>
) {
  return prisma.issue.update({ where: { id }, data: changes })
}

export function deleteIssue(id: string) {
  return prisma.$transaction([
    prisma.issueHistory.deleteMany({ where: { issueId: id } }),
    prisma.issue.delete({ where: { id } }),
  ])
}

export async function deleteProject(id: string) {
  await prisma.$transaction([
    prisma.issue.updateMany({ where: { projectId: id }, data: { projectId: null } }),
    prisma.project.delete({ where: { id } }),
  ])
}

export function mapRow(row: unknown): Record<string, unknown> {
  const mapped: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row as Record<string, unknown>)) {
    if (key === 'labelIds' && typeof value === 'string') {
      mapped[key] = JSON.parse(value)
    } else if (typeof value === 'bigint') {
      mapped[key] = Number(value)
    } else {
      mapped[key] = value
    }
  }
  return mapped
}
