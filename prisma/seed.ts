import { prisma } from '../lib/db.js'

async function backfillIssueOrder() {
  const issuesNeedingOrder = await prisma.issue.findMany({ where: { order: 0 } })
  if (issuesNeedingOrder.length === 0) return

  const states = ['backlog', 'todo', 'in_progress', 'done', 'canceled'] as const
  for (const state of states) {
    const issues = await prisma.issue.findMany({
      where: { state, order: 0 },
      orderBy: { updatedAt: 'desc' },
    })
    for (let i = 0; i < issues.length; i++) {
      await prisma.issue.update({
        where: { id: issues[i].id },
        data: { order: (i + 1) * 1024 },
      })
    }
  }
  console.log(`Backfilled order for ${issuesNeedingOrder.length} existing issues.`)
}

async function main() {
  await backfillIssueOrder()

  const existing = await prisma.team.findFirst()
  if (existing) {
    console.log('Database already seeded, skipping.')
    return
  }

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const teams = await prisma.$transaction([
    prisma.team.create({
      data: { id: crypto.randomUUID(), name: 'Engineering', key: 'ENG', color: '#5e6ad2', createdAt: now },
    }),
    prisma.team.create({
      data: { id: crypto.randomUUID(), name: 'Design', key: 'DES', color: '#e8a838', createdAt: now },
    }),
  ])

  const users = await prisma.$transaction([
    prisma.user.create({ data: { id: crypto.randomUUID(), name: 'Alex Chen', email: 'alex@example.com', createdAt: now } }),
    prisma.user.create({ data: { id: crypto.randomUUID(), name: 'Sam Taylor', email: 'sam@example.com', createdAt: now } }),
    prisma.user.create({ data: { id: crypto.randomUUID(), name: 'Jordan Lee', email: 'jordan@example.com', createdAt: now } }),
    prisma.user.create({ data: { id: crypto.randomUUID(), name: 'Morgan Park', email: 'morgan@example.com', createdAt: now } }),
  ])

  const labels = await prisma.$transaction([
    prisma.label.upsert({
      where: { name_teamId: { name: 'Bug', teamId: teams[0].id } },
      update: { isSystem: true, color: '#d13b3b' },
      create: { id: crypto.randomUUID(), name: 'Bug', color: '#d13b3b', isSystem: true, teamId: teams[0].id, createdAt: now },
    }),
    prisma.label.upsert({
      where: { name_teamId: { name: 'Feature', teamId: teams[0].id } },
      update: { isSystem: true, color: '#4da35a' },
      create: { id: crypto.randomUUID(), name: 'Feature', color: '#4da35a', isSystem: true, teamId: teams[0].id, createdAt: now },
    }),
    prisma.label.upsert({
      where: { name_teamId: { name: 'Refactor', teamId: teams[0].id } },
      update: { isSystem: true, color: '#8d6e63' },
      create: { id: crypto.randomUUID(), name: 'Refactor', color: '#8d6e63', isSystem: true, teamId: teams[0].id, createdAt: now },
    }),
    prisma.label.upsert({
      where: { name_teamId: { name: 'Improvement', teamId: teams[0].id } },
      update: {},
      create: { id: crypto.randomUUID(), name: 'Improvement', color: '#5e6ad2', teamId: teams[0].id, createdAt: now },
    }),
    prisma.label.upsert({
      where: { name_teamId: { name: 'Design', teamId: teams[1].id } },
      update: {},
      create: { id: crypto.randomUUID(), name: 'Design', color: '#e8a838', teamId: teams[1].id, createdAt: now },
    }),
    prisma.label.upsert({
      where: { name_teamId: { name: 'Research', teamId: teams[1].id } },
      update: {},
      create: { id: crypto.randomUUID(), name: 'Research', color: '#7c4dff', teamId: teams[1].id, createdAt: now },
    }),
  ])

  const projects = await prisma.$transaction([
    prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Q2 Platform Migration',
        description: 'Migrate core services to new infrastructure',
        teamId: teams[0].id,
        state: 'started',
        startDate: now - 14 * day,
        targetDate: now + 30 * day,
        createdAt: now,
      },
    }),
    prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Mobile App Redesign',
        description: 'Complete UI overhaul for iOS and Android',
        teamId: teams[1].id,
        state: 'started',
        startDate: now - 7 * day,
        targetDate: now + 45 * day,
        createdAt: now,
      },
    }),
    prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        name: 'API v2 Development',
        teamId: teams[0].id,
        state: 'planned',
        startDate: now + 14 * day,
        targetDate: now + 90 * day,
        createdAt: now,
      },
    }),
    prisma.project.create({
      data: {
        id: crypto.randomUUID(),
        name: 'Design System v3',
        teamId: teams[1].id,
        state: 'started',
        startDate: now - 30 * day,
        targetDate: now + 14 * day,
        createdAt: now,
      },
    }),
  ])

  const cycles = await prisma.$transaction([
    prisma.cycle.create({
      data: { id: crypto.randomUUID(), name: 'Cycle 12', number: 12, teamId: teams[0].id, startDate: now - 7 * day, endDate: now + 7 * day, createdAt: now },
    }),
    prisma.cycle.create({
      data: { id: crypto.randomUUID(), name: 'Cycle 13', number: 13, teamId: teams[0].id, startDate: now + 8 * day, endDate: now + 21 * day, createdAt: now },
    }),
    prisma.cycle.create({
      data: { id: crypto.randomUUID(), name: 'Cycle 8', number: 8, teamId: teams[1].id, startDate: now - 3 * day, endDate: now + 11 * day, createdAt: now },
    }),
  ])

  const issueTemplates = [
    { title: 'Set up Kubernetes cluster for staging', state: 'done', priority: 'high', projectIdx: 0, assigneeIdx: 0, labelIdxs: [2] },
    { title: 'Configure CI/CD pipeline with GitHub Actions', state: 'in_progress', priority: 'urgent', projectIdx: 0, assigneeIdx: 1, labelIdxs: [2] },
    { title: 'Migrate user service to new database', state: 'todo', priority: 'high', projectIdx: 0, assigneeIdx: 0, labelIdxs: [1] },
    { title: 'Update environment variable management', state: 'backlog', priority: 'medium', projectIdx: 0, assigneeIdx: 2, labelIdxs: [2] },
    { title: 'Set up monitoring with Datadog', state: 'todo', priority: 'medium', projectIdx: 0, assigneeIdx: 1, labelIdxs: [2] },
    { title: 'Design RESTful endpoint structure', state: 'backlog', priority: 'medium', projectIdx: 2, assigneeIdx: 0, labelIdxs: [1] },
    { title: 'Implement authentication middleware', state: 'backlog', priority: 'high', projectIdx: 2, assigneeIdx: 2, labelIdxs: [2] },
    { title: 'Fix memory leak in WebSocket handler', state: 'in_progress', priority: 'urgent', projectIdx: undefined, assigneeIdx: 2, labelIdxs: [0] },
    { title: 'Optimize database query for dashboard', state: 'done', priority: 'high', projectIdx: undefined, assigneeIdx: 0, labelIdxs: [2] },
    { title: 'Update dependency versions', state: 'todo', priority: 'low', projectIdx: undefined, assigneeIdx: 1, labelIdxs: [2] },
    { title: 'Create wireframes for home screen', state: 'done', priority: 'high', projectIdx: 1, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'Design component library in Figma', state: 'in_progress', priority: 'urgent', projectIdx: 1, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'User research interviews - Round 1', state: 'done', priority: 'medium', projectIdx: 1, assigneeIdx: 3, labelIdxs: [4] },
    { title: 'Prototype navigation flow', state: 'todo', priority: 'high', projectIdx: 1, assigneeIdx: undefined, labelIdxs: [3] },
    { title: 'Define color tokens and spacing scale', state: 'done', priority: 'high', projectIdx: 3, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'Create button component variants', state: 'in_progress', priority: 'medium', projectIdx: 3, assigneeIdx: 3, labelIdxs: [3] },
    { title: 'Document typography guidelines', state: 'todo', priority: 'low', projectIdx: 3, assigneeIdx: undefined, labelIdxs: [3] },
  ]

  let engCounter = 0
  let desCounter = 0
  const orderByState: Record<string, number> = {}

  for (const template of issueTemplates) {
    const teamId = template.projectIdx !== undefined ? projects[template.projectIdx].teamId : teams[0].id
    const isEng = teamId === teams[0].id
    const counter = isEng ? ++engCounter : ++desCounter
    const teamKey = isEng ? teams[0].key : teams[1].key
    orderByState[template.state] = (orderByState[template.state] ?? 0) + 1024

    await prisma.issue.create({
      data: {
        id: crypto.randomUUID(),
        identifier: `${teamKey}-${counter}`,
        title: template.title,
        description: '',
        state: template.state,
        priority: template.priority,
        assigneeId: template.assigneeIdx !== undefined ? users[template.assigneeIdx].id : null,
        projectId: template.projectIdx !== undefined ? projects[template.projectIdx].id : null,
        cycleId: isEng ? cycles[0].id : cycles[2].id,
        teamId,
        labelIds: JSON.stringify(template.labelIdxs.map((i) => labels[i].id)),
        order: orderByState[template.state],
        createdAt: now - Math.floor(Math.random() * 14 * day),
        updatedAt: now - Math.floor(Math.random() * 3 * day),
      },
    })
  }

  console.log('Seeded database.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
