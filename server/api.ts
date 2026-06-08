import express from 'express'
import cors from 'cors'
import {
  getTeams, getTeam, createTeam,
  getProjects, getProject, createProject, updateProject,
  getUsers, getUser, createUser,
  getLabels, createLabel,
  getIssues, getIssue, getIssueByIdentifier, getIssuesByTeam,
  getNextIdentifier, createIssue, updateIssue, deleteIssue,
  mapRow,
} from './db.js'

const app = express()
app.use(cors({ origin: process.env.CORS_ORIGIN || true }))
app.use(express.json())

// Teams
app.get('/api/teams', (_req, res) => {
  const rows = getTeams()
  res.json(rows.map(mapRow))
})

app.get('/api/teams/:id', (req, res) => {
  const row = getTeam(req.params.id)
  if (!row) return res.status(404).json({ error: 'Team not found' })
  res.json(mapRow(row))
})

app.post('/api/teams', (req, res) => {
  const data = { ...req.body, id: crypto.randomUUID(), created_at: Date.now() }
  createTeam(data as { id: string; name: string; key: string; color: string; created_at: number })
  res.status(201).json(mapRow(data))
})

// Projects
app.get('/api/projects', (req, res) => {
  const rows = getProjects(req.query.teamId as string | undefined)
  res.json(rows.map(mapRow))
})

app.get('/api/projects/:id', (req, res) => {
  const row = getProject(req.params.id)
  if (!row) return res.status(404).json({ error: 'Project not found' })
  res.json(mapRow(row))
})

app.post('/api/projects', (req, res) => {
  const data = {
    ...req.body,
    id: crypto.randomUUID(),
    team_id: req.body.teamId,
    start_date: req.body.startDate || null,
    target_date: req.body.targetDate || null,
    created_at: Date.now(),
  }
  delete data.teamId
  delete data.startDate
  delete data.targetDate
  createProject(data)
  res.status(201).json(mapRow(data))
})

app.patch('/api/projects/:id', (req, res) => {
  const changes: Record<string, unknown> = { ...req.body }

  if (changes.teamId !== undefined) { changes.team_id = changes.teamId; delete changes.teamId }
  if (changes.startDate !== undefined) { changes.start_date = changes.startDate; delete changes.startDate }
  if (changes.targetDate !== undefined) { changes.target_date = changes.targetDate; delete changes.targetDate }

  delete changes.id
  delete changes.createdAt

  updateProject(req.params.id, changes)
  const row = getProject(req.params.id)
  res.json(mapRow(row))
})

// Users
app.get('/api/users', (_req, res) => {
  const rows = getUsers()
  res.json(rows.map(mapRow))
})

app.get('/api/users/:id', (req, res) => {
  const row = getUser(req.params.id)
  if (!row) return res.status(404).json({ error: 'User not found' })
  res.json(mapRow(row))
})

app.post('/api/users', (req, res) => {
  const data = { ...req.body, id: crypto.randomUUID(), avatar_url: req.body.avatarUrl || null, created_at: Date.now() }
  delete data.avatarUrl
  createUser(data)
  res.status(201).json(mapRow(data))
})

// Labels
app.get('/api/labels', (req, res) => {
  const rows = getLabels(req.query.teamId as string | undefined)
  res.json(rows.map(mapRow))
})

app.post('/api/labels', (req, res) => {
  const data = { ...req.body, id: crypto.randomUUID(), team_id: req.body.teamId, created_at: Date.now() }
  delete data.teamId
  createLabel(data)
  res.status(201).json(mapRow(data))
})

// Issues
app.get('/api/issues', (req, res) => {
  const filters = {
    teamId: req.query.teamId as string | undefined,
    state: req.query.state as string | undefined,
    projectId: req.query.projectId as string | undefined,
    assigneeId: req.query.assigneeId as string | undefined,
  }
  const rows = getIssues(filters)
  res.json(rows.map(mapRow))
})

app.get('/api/issues/:id', (req, res) => {
  const row = getIssue(req.params.id) || getIssueByIdentifier(req.params.id)
  if (!row) return res.status(404).json({ error: 'Issue not found' })
  res.json(mapRow(row))
})

app.get('/api/teams/:teamId/issues', (req, res) => {
  const rows = getIssuesByTeam(req.params.teamId)
  res.json(rows.map(mapRow))
})

app.post('/api/issues', async (req, res) => {
  const teamId = req.body.teamId
  const identifier = getNextIdentifier(teamId)
  const now = Date.now()
  const data = {
    ...req.body,
    id: crypto.randomUUID(),
    identifier,
    label_ids: JSON.stringify(req.body.labelIds || []),
    team_id: teamId,
    assignee_id: req.body.assigneeId || null,
    project_id: req.body.projectId || null,
    cycle_id: req.body.cycleId || null,
    created_at: now,
    updated_at: now,
  }
  delete data.teamId
  delete data.labelIds
  delete data.assigneeId
  delete data.projectId
  delete data.cycleId
  createIssue(data)
  res.status(201).json(mapRow(data))
})

app.patch('/api/issues/:id', (req, res) => {
  const changes: Record<string, unknown> = { ...req.body, updated_at: Date.now() }

  // Map camelCase keys to snake_case
  if (changes.labelIds !== undefined) {
    changes.label_ids = JSON.stringify(changes.labelIds)
    delete changes.labelIds
  }
  if (changes.assigneeId !== undefined) { changes.assignee_id = changes.assigneeId; delete changes.assigneeId }
  if (changes.projectId !== undefined) { changes.project_id = changes.projectId; delete changes.projectId }
  if (changes.cycleId !== undefined) { changes.cycle_id = changes.cycleId; delete changes.cycleId }
  if (changes.teamId !== undefined) { changes.team_id = changes.teamId; delete changes.teamId }

  // Remove keys that don't exist in DB
  delete changes.id
  delete changes.identifier
  delete changes.createdAt

  updateIssue(req.params.id, changes)
  const row = getIssue(req.params.id)
  res.json(mapRow(row))
})

app.delete('/api/issues/:id', (req, res) => {
  deleteIssue(req.params.id)
  res.status(204).send()
})

export default app
