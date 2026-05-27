export type IssueState = 'backlog' | 'todo' | 'in_progress' | 'done' | 'canceled'
export type Priority = 'no_priority' | 'low' | 'medium' | 'high' | 'urgent'
export type ProjectState = 'planned' | 'started' | 'paused' | 'completed' | 'canceled'
export type ViewType = 'board' | 'list'

export interface Team {
  id: string
  name: string
  key: string
  color: string
  createdAt: number
}

export interface Project {
  id: string
  name: string
  description?: string
  teamId: string
  state: ProjectState
  startDate?: number
  targetDate?: number
  createdAt: number
}

export interface Cycle {
  id: string
  name: string
  number: number
  teamId: string
  startDate: number
  endDate: number
  createdAt: number
}

export interface Label {
  id: string
  name: string
  color: string
  teamId: string
  createdAt: number
}

export interface User {
  id: string
  name: string
  email: string
  avatarUrl?: string
  createdAt: number
}

export interface Issue {
  id: string
  identifier: string
  title: string
  description?: string
  state: IssueState
  priority: Priority
  assigneeId?: string
  projectId?: string
  cycleId?: string
  teamId: string
  labelIds: string[]
  createdAt: number
  updatedAt: number
}

export interface IssueHistory {
  id: string
  issueId: string
  field: string
  oldValue?: string
  newValue?: string
  createdAt: number
}

export interface View {
  id: string
  name: string
  type: ViewType
  filters?: Record<string, unknown>
  teamId?: string
  projectId?: string
  createdAt: number
}
