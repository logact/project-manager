import express from 'express'
import cors from 'cors'
import {
  getTeams, getTeam, createTeam,
  getProjects, getProject, createProject,
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
  const data = { ...req.body, id: crypto.randomUUID(), created_at: Date.now() }
  createProject(data)
  res.status(201).json(mapRow(data))
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
  const data = { ...req.body, id: crypto.randomUUID(), created_at: Date.now() }
  createUser(data)
  res.status(201).json(mapRow(data))
})

// Labels
app.get('/api/labels', (req, res) => {
  const rows = getLabels(req.query.teamId as string | undefined)
  res.json(rows.map(mapRow))
})

app.post('/api/labels', (req, res) => {
  const data = { ...req.body, id: crypto.randomUUID(), created_at: Date.now() }
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
    created_at: now,
    updated_at: now,
  }
  createIssue(data)
  res.status(201).json(mapRow(data))
})

app.patch('/api/issues/:id', (req, res) => {
  const changes: Record<string, unknown> = { ...req.body, updated_at: Date.now() }
  if (changes.labelIds !== undefined) {
    changes.label_ids = JSON.stringify(changes.labelIds)
    delete changes.labelIds
  }
  // Remove camelCase keys that don't exist in DB
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
