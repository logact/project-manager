import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data')
const DB_PATH = path.join(DATA_DIR, 'project-manager.db')

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
}

export const db = new Database(DB_PATH)
db.pragma('journal_mode = WAL')

// Create tables
export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      team_id TEXT NOT NULL,
      state TEXT NOT NULL,
      start_date INTEGER,
      target_date INTEGER,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS cycles (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      number INTEGER NOT NULL,
      team_id TEXT NOT NULL,
      start_date INTEGER NOT NULL,
      end_date INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      team_id TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id)
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      avatar_url TEXT,
      created_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS issues (
      id TEXT PRIMARY KEY,
      identifier TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      state TEXT NOT NULL,
      priority TEXT NOT NULL,
      assignee_id TEXT,
      project_id TEXT,
      cycle_id TEXT,
      team_id TEXT NOT NULL,
      label_ids TEXT NOT NULL DEFAULT '[]',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id),
      FOREIGN KEY (assignee_id) REFERENCES users(id),
      FOREIGN KEY (project_id) REFERENCES projects(id),
      FOREIGN KEY (cycle_id) REFERENCES cycles(id)
    );

    CREATE TABLE IF NOT EXISTS issue_history (
      id TEXT PRIMARY KEY,
      issue_id TEXT NOT NULL,
      field TEXT NOT NULL,
      old_value TEXT,
      new_value TEXT,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (issue_id) REFERENCES issues(id)
    );

    CREATE TABLE IF NOT EXISTS views (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      filters TEXT,
      team_id TEXT,
      project_id TEXT,
      created_at INTEGER NOT NULL
    );
  `)
}

// Seed data
export function seedDb() {
  const teamCount = db.prepare('SELECT COUNT(*) as count FROM teams').get() as { count: number }
  if (teamCount.count > 0) return

  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const teams = [
    { id: crypto.randomUUID(), name: 'Engineering', key: 'ENG', color: '#5e6ad2', created_at: now },
    { id: crypto.randomUUID(), name: 'Design', key: 'DES', color: '#e8a838', created_at: now },
  ]

  const users = [
    { id: crypto.randomUUID(), name: 'Alex Chen', email: 'alex@example.com', created_at: now },
    { id: crypto.randomUUID(), name: 'Sam Taylor', email: 'sam@example.com', created_at: now },
    { id: crypto.randomUUID(), name: 'Jordan Lee', email: 'jordan@example.com', created_at: now },
    { id: crypto.randomUUID(), name: 'Morgan Park', email: 'morgan@example.com', created_at: now },
  ]

  const labels = [
    { id: crypto.randomUUID(), name: 'Bug', color: '#d13b3b', team_id: teams[0].id, created_at: now },
    { id: crypto.randomUUID(), name: 'Feature', color: '#4da35a', team_id: teams[0].id, created_at: now },
    { id: crypto.randomUUID(), name: 'Improvement', color: '#5e6ad2', team_id: teams[0].id, created_at: now },
    { id: crypto.randomUUID(), name: 'Design', color: '#e8a838', team_id: teams[1].id, created_at: now },
    { id: crypto.randomUUID(), name: 'Research', color: '#7c4dff', team_id: teams[1].id, created_at: now },
  ]

  const projects = [
    {
      id: crypto.randomUUID(), name: 'Q2 Platform Migration', description: 'Migrate core services to new infrastructure',
      team_id: teams[0].id, state: 'started', start_date: now - 14 * day, target_date: now + 30 * day, created_at: now,
    },
    {
      id: crypto.randomUUID(), name: 'Mobile App Redesign', description: 'Complete UI overhaul for iOS and Android',
      team_id: teams[1].id, state: 'started', start_date: now - 7 * day, target_date: now + 45 * day, created_at: now,
    },
    {
      id: crypto.randomUUID(), name: 'API v2 Development',
      team_id: teams[0].id, state: 'planned', start_date: now + 14 * day, target_date: now + 90 * day, created_at: now,
    },
    {
      id: crypto.randomUUID(), name: 'Design System v3',
      team_id: teams[1].id, state: 'started', start_date: now - 30 * day, target_date: now + 14 * day, created_at: now,
    },
  ]

  const cycles = [
    {
      id: crypto.randomUUID(), name: 'Cycle 12', number: 12, team_id: teams[0].id,
      start_date: now - 7 * day, end_date: now + 7 * day, created_at: now,
    },
    {
      id: crypto.randomUUID(), name: 'Cycle 13', number: 13, team_id: teams[0].id,
      start_date: now + 8 * day, end_date: now + 21 * day, created_at: now,
    },
    {
      id: crypto.randomUUID(), name: 'Cycle 8', number: 8, team_id: teams[1].id,
      start_date: now - 3 * day, end_date: now + 11 * day, created_at: now,
    },
  ]

  const insertTeam = db.prepare('INSERT INTO teams (id, name, key, color, created_at) VALUES (?, ?, ?, ?, ?)')
  const insertUser = db.prepare('INSERT INTO users (id, name, email, created_at) VALUES (?, ?, ?, ?)')
  const insertLabel = db.prepare('INSERT INTO labels (id, name, color, team_id, created_at) VALUES (?, ?, ?, ?, ?)')
  const insertProject = db.prepare('INSERT INTO projects (id, name, description, team_id, state, start_date, target_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
  const insertCycle = db.prepare('INSERT INTO cycles (id, name, number, team_id, start_date, end_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')

  for (const t of teams) insertTeam.run(t.id, t.name, t.key, t.color, t.created_at)
  for (const u of users) insertUser.run(u.id, u.name, u.email, u.created_at)
  for (const l of labels) insertLabel.run(l.id, l.name, l.color, l.team_id, l.created_at)
  for (const p of projects) insertProject.run(p.id, p.name, p.description, p.team_id, p.state, p.start_date, p.target_date, p.created_at)
  for (const c of cycles) insertCycle.run(c.id, c.name, c.number, c.team_id, c.start_date, c.end_date, c.created_at)

  let engCounter = 0
  let desCounter = 0

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

  const insertIssue = db.prepare(`
    INSERT INTO issues (id, identifier, title, description, state, priority, assignee_id, project_id, cycle_id, team_id, label_ids, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `)

  for (const template of issueTemplates) {
    const teamId = template.projectIdx !== undefined ? projects[template.projectIdx].team_id : teams[0].id
    const isEng = teamId === teams[0].id
    const counter = isEng ? ++engCounter : ++desCounter
    const teamKey = isEng ? teams[0].key : teams[1].key

    insertIssue.run(
      crypto.randomUUID(),
      `${teamKey}-${counter}`,
      template.title,
      '',
      template.state,
      template.priority,
      template.assigneeIdx !== undefined ? users[template.assigneeIdx].id : null,
      template.projectIdx !== undefined ? projects[template.projectIdx].id : null,
      isEng ? cycles[0].id : cycles[2].id,
      teamId,
      JSON.stringify(template.labelIdxs.map((i: number) => labels[i].id)),
      now - Math.floor(Math.random() * 14 * day),
      now - Math.floor(Math.random() * 3 * day)
    )
  }
}

// --- CRUD Helpers ---

export function getTeams() {
  return db.prepare('SELECT * FROM teams ORDER BY created_at').all()
}

export function getTeam(id: string) {
  return db.prepare('SELECT * FROM teams WHERE id = ?').get(id)
}

export function createTeam(data: { id: string; name: string; key: string; color: string; created_at: number }) {
  db.prepare('INSERT INTO teams (id, name, key, color, created_at) VALUES (?, ?, ?, ?, ?)')
    .run(data.id, data.name, data.key, data.color, data.created_at)
  return data
}

export function getProjects(teamId?: string) {
  if (teamId) {
    return db.prepare('SELECT * FROM projects WHERE team_id = ? ORDER BY created_at').all(teamId)
  }
  return db.prepare('SELECT * FROM projects ORDER BY created_at').all()
}

export function getProject(id: string) {
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(id)
}

export function createProject(data: Record<string, unknown>) {
  const cols = Object.keys(data).join(', ')
  const placeholders = Object.keys(data).map(() => '?').join(', ')
  db.prepare(`INSERT INTO projects (${cols}) VALUES (${placeholders})`).run(...Object.values(data))
  return data
}

export function updateProject(id: string, changes: Record<string, unknown>) {
  const sets = Object.keys(changes).map((k) => `${k} = ?`).join(', ')
  const values = [...Object.values(changes), id]
  db.prepare(`UPDATE projects SET ${sets} WHERE id = ?`).run(...values)
}

export function getUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at').all()
}

export function getUser(id: string) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id)
}

export function createUser(data: Record<string, unknown>) {
  const cols = Object.keys(data).join(', ')
  const placeholders = Object.keys(data).map(() => '?').join(', ')
  db.prepare(`INSERT INTO users (${cols}) VALUES (${placeholders})`).run(...Object.values(data))
  return data
}

export function getLabels(teamId?: string) {
  if (teamId) {
    return db.prepare('SELECT * FROM labels WHERE team_id = ? ORDER BY created_at').all(teamId)
  }
  return db.prepare('SELECT * FROM labels ORDER BY created_at').all()
}

export function createLabel(data: Record<string, unknown>) {
  const cols = Object.keys(data).join(', ')
  const placeholders = Object.keys(data).map(() => '?').join(', ')
  db.prepare(`INSERT INTO labels (${cols}) VALUES (${placeholders})`).run(...Object.values(data))
  return data
}

export interface IssueFilters {
  teamId?: string
  state?: string
  projectId?: string
  assigneeId?: string
}

export function getIssues(filters?: IssueFilters) {
  let sql = 'SELECT * FROM issues WHERE 1=1'
  const params: (string | null)[] = []

  if (filters?.teamId) {
    sql += ' AND team_id = ?'
    params.push(filters.teamId)
  }
  if (filters?.state) {
    sql += ' AND state = ?'
    params.push(filters.state)
  }
  if (filters?.projectId) {
    sql += ' AND project_id = ?'
    params.push(filters.projectId)
  }
  if (filters?.assigneeId) {
    sql += ' AND assignee_id = ?'
    params.push(filters.assigneeId)
  }

  sql += ' ORDER BY updated_at DESC'
  return db.prepare(sql).all(...params)
}

export function getIssue(id: string) {
  return db.prepare('SELECT * FROM issues WHERE id = ?').get(id)
}

export function getIssueByIdentifier(identifier: string) {
  return db.prepare('SELECT * FROM issues WHERE identifier = ?').get(identifier)
}

export function getIssuesByTeam(teamId: string) {
  return db.prepare('SELECT * FROM issues WHERE team_id = ? ORDER BY priority DESC, updated_at DESC').all(teamId)
}

export function getNextIdentifier(teamId: string): string {
  const team = getTeam(teamId) as { key: string } | undefined
  if (!team) throw new Error('Team not found')

  const result = db.prepare('SELECT identifier FROM issues WHERE team_id = ?').all(teamId) as { identifier: string }[]
  const numbers = result
    .map((i) => parseInt(i.identifier.split('-')[1] || '0'))
    .filter((n) => !isNaN(n))
  const max = numbers.length > 0 ? Math.max(...numbers) : 0

  return `${team.key}-${max + 1}`
}

export function createIssue(data: Record<string, unknown>) {
  const cols = Object.keys(data).join(', ')
  const placeholders = Object.keys(data).map(() => '?').join(', ')
  db.prepare(`INSERT INTO issues (${cols}) VALUES (${placeholders})`).run(...Object.values(data))
  return data
}

export function updateIssue(id: string, changes: Record<string, unknown>) {
  const sets = Object.keys(changes).map((k) => `${k} = ?`).join(', ')
  const values = [...Object.values(changes), id]
  db.prepare(`UPDATE issues SET ${sets} WHERE id = ?`).run(...values)
}

export function deleteIssue(id: string) {
  db.prepare('DELETE FROM issue_history WHERE issue_id = ?').run(id)
  db.prepare('DELETE FROM issues WHERE id = ?').run(id)
}

export function deleteProject(id: string) {
  db.prepare('UPDATE issues SET project_id = NULL WHERE project_id = ?').run(id)
  db.prepare('DELETE FROM projects WHERE id = ?').run(id)
}

export function deleteTeam(id: string) {
  db.prepare('DELETE FROM issue_history WHERE issue_id IN (SELECT id FROM issues WHERE team_id = ?)').run(id)
  db.prepare('DELETE FROM issues WHERE team_id = ?').run(id)
  db.prepare('DELETE FROM labels WHERE team_id = ?').run(id)
  db.prepare('DELETE FROM cycles WHERE team_id = ?').run(id)
  db.prepare('DELETE FROM projects WHERE team_id = ?').run(id)
  db.prepare('DELETE FROM teams WHERE id = ?').run(id)
}

// Helper to map DB row (snake_case) to app object (camelCase)
export function mapRow(row: Record<string, unknown>): Record<string, unknown> {
  const mapped: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(row)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
    mapped[camelKey] = key === 'label_ids' && typeof value === 'string' ? JSON.parse(value) : value
  }
  return mapped
}
