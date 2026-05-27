import Dexie, { type Table } from 'dexie'
import type { Issue, IssueHistory, Project, Cycle, Label, Team, User, View } from '../types'

export class ProjectManagerDB extends Dexie {
  teams!: Table<Team>
  projects!: Table<Project>
  cycles!: Table<Cycle>
  labels!: Table<Label>
  users!: Table<User>
  issues!: Table<Issue>
  issueHistory!: Table<IssueHistory>
  views!: Table<View>

  constructor() {
    super('ProjectManagerDB')
    this.version(1).stores({
      teams: 'id, key',
      projects: 'id, teamId, state',
      cycles: 'id, teamId, startDate',
      labels: 'id, teamId',
      users: 'id, email',
      issues: 'id, [teamId+state], identifier, assigneeId, projectId, cycleId, [teamId+priority]',
      issueHistory: 'id, issueId, createdAt',
      views: 'id, type, teamId',
    })
  }
}

export const db = new ProjectManagerDB()
