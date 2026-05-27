import { db } from './schema'
import { generateId } from '../lib/utils'

const now = Date.now()
const day = 24 * 60 * 60 * 1000

export async function seedDatabase() {
  const teamCount = await db.teams.count()
  if (teamCount > 0) return

  // Teams
  const teams = [
    { id: generateId(), name: 'Engineering', key: 'ENG', color: '#5e6ad2', createdAt: now },
    { id: generateId(), name: 'Design', key: 'DES', color: '#e8a838', createdAt: now },
  ]
  await db.teams.bulkAdd(teams)

  // Users
  const users = [
    { id: generateId(), name: 'Alex Chen', email: 'alex@example.com', createdAt: now },
    { id: generateId(), name: 'Sam Taylor', email: 'sam@example.com', createdAt: now },
    { id: generateId(), name: 'Jordan Lee', email: 'jordan@example.com', createdAt: now },
    { id: generateId(), name: 'Morgan Park', email: 'morgan@example.com', createdAt: now },
  ]
  await db.users.bulkAdd(users)

  // Labels
  const labels = [
    { id: generateId(), name: 'Bug', color: '#d13b3b', teamId: teams[0].id, createdAt: now },
    { id: generateId(), name: 'Feature', color: '#4da35a', teamId: teams[0].id, createdAt: now },
    { id: generateId(), name: 'Improvement', color: '#5e6ad2', teamId: teams[0].id, createdAt: now },
    { id: generateId(), name: 'Design', color: '#e8a838', teamId: teams[1].id, createdAt: now },
    { id: generateId(), name: 'Research', color: '#7c4dff', teamId: teams[1].id, createdAt: now },
  ]
  await db.labels.bulkAdd(labels)

  // Projects
  const projects = [
    {
      id: generateId(), name: 'Q2 Platform Migration', description: 'Migrate core services to new infrastructure',
      teamId: teams[0].id, state: 'started' as const, startDate: now - 14 * day, targetDate: now + 30 * day, createdAt: now,
    },
    {
      id: generateId(), name: 'Mobile App Redesign', description: 'Complete UI overhaul for iOS and Android',
      teamId: teams[1].id, state: 'started' as const, startDate: now - 7 * day, targetDate: now + 45 * day, createdAt: now,
    },
    {
      id: generateId(), name: 'API v2 Development',
      teamId: teams[0].id, state: 'planned' as const, startDate: now + 14 * day, targetDate: now + 90 * day, createdAt: now,
    },
    {
      id: generateId(), name: 'Design System v3',
      teamId: teams[1].id, state: 'started' as const, startDate: now - 30 * day, targetDate: now + 14 * day, createdAt: now,
    },
  ]
  await db.projects.bulkAdd(projects)

  // Cycles
  const cycles = [
    {
      id: generateId(), name: 'Cycle 12', number: 12, teamId: teams[0].id,
      startDate: now - 7 * day, endDate: now + 7 * day, createdAt: now,
    },
    {
      id: generateId(), name: 'Cycle 13', number: 13, teamId: teams[0].id,
      startDate: now + 8 * day, endDate: now + 21 * day, createdAt: now,
    },
    {
      id: generateId(), name: 'Cycle 8', number: 8, teamId: teams[1].id,
      startDate: now - 3 * day, endDate: now + 11 * day, createdAt: now,
    },
  ]
  await db.cycles.bulkAdd(cycles)

  // Issues
  let engCounter = 0
  let desCounter = 0

  const issueTemplates = [
    // Engineering - Q2 Platform Migration
    { title: 'Set up Kubernetes cluster for staging', state: 'done' as const, priority: 'high' as const, projectIdx: 0, assigneeIdx: 0, labelIdxs: [2] },
    { title: 'Configure CI/CD pipeline with GitHub Actions', state: 'in_progress' as const, priority: 'urgent' as const, projectIdx: 0, assigneeIdx: 1, labelIdxs: [2] },
    { title: 'Migrate user service to new database', state: 'todo' as const, priority: 'high' as const, projectIdx: 0, assigneeIdx: 0, labelIdxs: [1] },
    { title: 'Update environment variable management', state: 'backlog' as const, priority: 'medium' as const, projectIdx: 0, assigneeIdx: 2, labelIdxs: [2] },
    { title: 'Set up monitoring with Datadog', state: 'todo' as const, priority: 'medium' as const, projectIdx: 0, assigneeIdx: 1, labelIdxs: [2] },
    // Engineering - API v2
    { title: 'Design RESTful endpoint structure', state: 'backlog' as const, priority: 'medium' as const, projectIdx: 2, assigneeIdx: 0, labelIdxs: [1] },
    { title: 'Implement authentication middleware', state: 'backlog' as const, priority: 'high' as const, projectIdx: 2, assigneeIdx: 2, labelIdxs: [2] },
    // Engineering - Misc
    { title: 'Fix memory leak in WebSocket handler', state: 'in_progress' as const, priority: 'urgent' as const, projectIdx: undefined, assigneeIdx: 2, labelIdxs: [0] },
    { title: 'Optimize database query for dashboard', state: 'done' as const, priority: 'high' as const, projectIdx: undefined, assigneeIdx: 0, labelIdxs: [2] },
    { title: 'Update dependency versions', state: 'todo' as const, priority: 'low' as const, projectIdx: undefined, assigneeIdx: 1, labelIdxs: [2] },
    // Design - Mobile App Redesign
    { title: 'Create wireframes for home screen', state: 'done' as const, priority: 'high' as const, projectIdx: 1, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'Design component library in Figma', state: 'in_progress' as const, priority: 'urgent' as const, projectIdx: 1, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'User research interviews - Round 1', state: 'done' as const, priority: 'medium' as const, projectIdx: 1, assigneeIdx: 3, labelIdxs: [4] },
    { title: 'Prototype navigation flow', state: 'todo' as const, priority: 'high' as const, projectIdx: 1, assigneeIdx: undefined, labelIdxs: [3] },
    // Design - Design System
    { title: 'Define color tokens and spacing scale', state: 'done' as const, priority: 'high' as const, projectIdx: 3, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'Create button component variants', state: 'in_progress' as const, priority: 'medium' as const, projectIdx: 3, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'Document typography guidelines', state: 'todo' as const, priority: 'low' as const, projectIdx: 3, assigneeIdx: undefined, labelIdxs: [3] },
  ]

  const issues = issueTemplates.map((template) => {
    const teamId = template.projectIdx !== undefined ? projects[template.projectIdx].teamId : teams[0].id
    const isEng = teamId === teams[0].id
    const counter = isEng ? ++engCounter : ++desCounter
    const teamKey = isEng ? teams[0].key : teams[1].key

    return {
      id: generateId(),
      identifier: `${teamKey}-${counter}`,
      title: template.title,
      description: '',
      state: template.state,
      priority: template.priority,
      assigneeId: template.assigneeIdx !== undefined ? users[template.assigneeIdx].id : undefined,
      projectId: template.projectIdx !== undefined ? projects[template.projectIdx].id : undefined,
      cycleId: isEng ? cycles[0].id : cycles[2].id,
      teamId,
      labelIds: template.labelIdxs.map((i) => labels[i].id),
      createdAt: now - Math.floor(Math.random() * 14 * day),
      updatedAt: now - Math.floor(Math.random() * 3 * day),
    }
  })

  await db.issues.bulkAdd(issues)
}
