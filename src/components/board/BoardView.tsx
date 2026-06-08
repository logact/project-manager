import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { LayoutGrid, List as ListIcon, Plus } from 'lucide-react'
import BoardColumn from './BoardColumn'
import IssueModal from '../issue/IssueModal'
import Button from '../ui/Button'
import { useIssuesByTeam, updateIssue } from '../../hooks/useIssues'
import type { Issue, IssueState } from '../../types'

const columns: { state: IssueState; title: string }[] = [
  { state: 'backlog', title: 'Backlog' },
  { state: 'todo', title: 'Todo' },
  { state: 'in_progress', title: 'In Progress' },
  { state: 'done', title: 'Done' },
  { state: 'canceled', title: 'Canceled' },
]

interface BoardViewProps {
  teamId?: string
  projectId?: string
  title?: string
}

export default function BoardView({ teamId: propTeamId, projectId: propProjectId, title: propTitle }: BoardViewProps) {
  const params = useParams()
  const navigate = useNavigate()
  const teamId = propTeamId || params.teamId || ''
  const projectId = propProjectId || params.projectId
  const issuesQuery = useIssuesByTeam(teamId)
  const issues = issuesQuery.data ?? []

  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const listPath = useMemo(() => {
    if (params.teamId) return `/team/${params.teamId}/list`
    if (params.projectId) return `/project/${params.projectId}/list`
    return '/list'
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
    if (projectId) {
      return issues.filter((i) => i.projectId === projectId)
    }
    return issues
  }, [issues, projectId])

  const issuesByState = useMemo(() => {
    const map: Record<string, Issue[]> = {}
    columns.forEach((col) => {
      map[col.state] = filteredIssues.filter((i) => i.state === col.state)
    })
    return map
  }, [filteredIssues])

  const handleDrop = async (issueId: string, newState: IssueState) => {
    await updateIssue(issueId, { state: newState })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border-subtle">
        <div className="flex items-center gap-4">
          <h1 className="text-base font-medium text-text">
            {propTitle || 'Issues'}
          </h1>
          <span className="text-xs text-text-muted">{filteredIssues.length} issues</span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-bg-tertiary rounded border border-border">
            <button className="p-1.5 text-text bg-bg-hover rounded-l">
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              className="p-1.5 text-text-muted hover:text-text rounded-r"
              onClick={() => navigate(listPath)}
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <Button variant="primary" size="sm" onClick={() => setIsCreating(true)}>
            <Plus className="w-3.5 h-3.5" />
            New Issue
          </Button>
        </div>
      </div>

      {/* Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden">
        <div className="flex h-full gap-3 px-5 py-3 min-w-max">
          {columns.map((col) => (
            <BoardColumn
              key={col.state}
              state={col.state}
              title={col.title}
              issues={issuesByState[col.state] || []}
              onIssueClick={setSelectedIssue}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Modals */}
      {isCreating && (
        <IssueModal
          teamId={teamId}
          onClose={() => setIsCreating(false)}
        />
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
