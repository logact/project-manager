import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, Plus, ArrowUpDown } from 'lucide-react'
import IssueModal from '../issue/IssueModal'
import Button from '../ui/Button'
import PriorityIcon from '../issue/PriorityIcon'
import AssigneeAvatar from '../issue/AssigneeAvatar'
import StateBadge from '../issue/StateBadge'
import { useIssuesByTeam } from '../../hooks/useIssues'
import { useUser } from '../../hooks/useUsers'
import { useProject } from '../../hooks/useProjects'
import { formatDate } from '../../lib/utils'
import type { Issue } from '../../types'

interface ListViewProps {
  teamId?: string
  projectId?: string
  title?: string
  activeOnly?: boolean
}

export default function ListView({ teamId: propTeamId, projectId: propProjectId, title: propTitle, activeOnly }: ListViewProps) {
  const params = useParams()
  const navigate = useNavigate()
  const teamId = propTeamId || params.teamId || ''
  const projectId = propProjectId || params.projectId
  const issuesQuery = useIssuesByTeam(teamId)
  const issues = issuesQuery.data ?? []

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [sortField, setSortField] = useState<'priority' | 'updatedAt' | 'createdAt'>('updatedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const boardPath = useMemo(() => {
    if (params.teamId) return `/team/${params.teamId}`
    if (params.projectId) return `/project/${params.projectId}`
    return '/board'
  }, [params.teamId, params.projectId])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        setIsCreating(true)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const filteredIssues = useMemo(() => {
    let result = projectId ? issues.filter((i) => i.projectId === projectId) : [...issues]
    if (activeOnly) {
      result = result.filter((i) => i.state !== 'done' && i.state !== 'canceled')
    }
    return result.sort((a, b) => {
      let cmp = 0
      if (sortField === 'priority') {
        const order = ['no_priority', 'low', 'medium', 'high', 'urgent']
        cmp = order.indexOf(b.priority) - order.indexOf(a.priority)
      } else {
        cmp = b[sortField] - a[sortField]
      }
      return sortDir === 'asc' ? -cmp : cmp
    })
  }, [issues, projectId, sortField, sortDir, activeOnly])

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))
    } else {
      setSortField(field)
      setSortDir('desc')
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-medium text-text">{propTitle || 'Issues'}</h1>
          <span className="text-xs text-text-muted">{filteredIssues.length} issues</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-bg-tertiary rounded border border-border">
            <button
              className="p-1.5 text-text-muted hover:text-text rounded-l"
              onClick={() => navigate(boardPath)}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 text-text bg-bg-hover rounded-r">
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>
          <Button variant="primary" size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-[800px]">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_100px_80px_120px_120px_100px] gap-2 px-5 py-2 border-b border-border text-[11px] text-text-muted uppercase tracking-wider">
            <button className="text-left flex items-center gap-1 hover:text-text transition-colors">
              Title
            </button>
            <button
              onClick={() => toggleSort('priority')}
              className="text-left flex items-center gap-1 hover:text-text transition-colors"
            >
              Priority
              <ArrowUpDown className="w-3 h-3" />
            </button>
            <span>State</span>
            <span>Assignee</span>
            <span>Project</span>
            <button
              onClick={() => toggleSort('updatedAt')}
              className="text-left flex items-center gap-1 hover:text-text transition-colors"
            >
              Updated
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>

          {/* Table rows */}
          {filteredIssues.map((issue) => (
            <ListRow
              key={issue.id}
              issue={issue}
              onClick={() => setSelectedIssue(issue)}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {isCreating && (
        <IssueModal teamId={teamId} onClose={() => setIsCreating(false)} />
      )}
      {selectedIssue && (
        <IssueModal
          issueId={selectedIssue.id}
          onClose={() => setSelectedIssue(null)}
          onDeleted={() => setSelectedIssue(null)}
        />
      )}
    </div>
  )
}

function ListRow({ issue, onClick }: { issue: Issue; onClick: () => void }) {
  const assigneeQuery = useUser(issue.assigneeId)
  const assignee = assigneeQuery.data
  const projectQuery = useProject(issue.projectId)
  const project = projectQuery.data

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[1fr_100px_80px_120px_120px_100px] gap-2 px-5 py-2.5 border-b border-border-subtle hover:bg-bg-hover cursor-pointer transition-colors items-center"
    >
      <div className="flex items-center gap-2 min-w-0">
        <PriorityIcon priority={issue.priority} size="xs" />
        <span className="text-[11px] text-text-muted font-mono flex-shrink-0">{issue.identifier}</span>
        <span className="text-sm text-text truncate">{issue.title}</span>
      </div>

      <div>
        <PriorityIcon priority={issue.priority} size="sm" />
      </div>

      <div>
        <StateBadge state={issue.state} />
      </div>

      <div className="flex items-center gap-2">
        {assignee ? (
          <>
            <AssigneeAvatar userId={issue.assigneeId} size="xs" />
            <span className="text-xs text-text-secondary truncate">{assignee.name}</span>
          </>
        ) : (
          <span className="text-xs text-text-muted">—</span>
        )}
      </div>

      <div className="text-xs text-text-secondary truncate">
        {project?.name || '—'}
      </div>

      <div className="text-xs text-text-muted">
        {formatDate(issue.updatedAt)}
      </div>
    </div>
  )
}
