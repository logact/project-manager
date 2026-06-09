import type { IssueState, Priority, ProjectState } from '../types'

export const ISSUE_STATES: { value: IssueState; label: string; color: string }[] = [
  { value: 'backlog', label: 'Backlog', color: 'text-text-muted' },
  { value: 'todo', label: 'Todo', color: 'text-text-secondary' },
  { value: 'in_progress', label: 'In Progress', color: 'text-accent' },
  { value: 'done', label: 'Done', color: 'text-success' },
  { value: 'canceled', label: 'Canceled', color: 'text-danger' },
]

export const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: 'no_priority', label: 'No priority', color: 'text-text-muted' },
  { value: 'low', label: 'Low', color: 'text-priority-low' },
  { value: 'medium', label: 'Medium', color: 'text-priority-medium' },
  { value: 'high', label: 'High', color: 'text-priority-high' },
  { value: 'urgent', label: 'Urgent', color: 'text-priority-urgent' },
]

export const PROJECT_STATES: { value: ProjectState; label: string }[] = [
  { value: 'planned', label: 'Planned' },
  { value: 'started', label: 'Started' },
  { value: 'paused', label: 'Paused' },
  { value: 'completed', label: 'Completed' },
  { value: 'canceled', label: 'Canceled' },
]

export const LABEL_COLORS = [
  '#5e6ad2', '#4da35a', '#e8a838', '#d13b3b',
  '#7c4dff', '#00bcd4', '#ff7043', '#8d6e63',
]

export const TEAM_COLORS = [
  '#5e6ad2', '#4da35a', '#e8a838', '#d13b3b',
  '#7c4dff', '#00bcd4', '#ff7043', '#8d6e63',
]
