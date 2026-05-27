import IssueCard from '../issue/IssueCard'
import type { Issue, IssueState } from '../../types'

interface BoardColumnProps {
  state: IssueState
  title: string
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onDrop: (issueId: string, newState: IssueState) => void
}

export default function BoardColumn({ state, title, issues, onIssueClick, onDrop }: BoardColumnProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const issueId = e.dataTransfer.getData('issueId')
    if (issueId) {
      onDrop(issueId, state)
    }
  }

  return (
    <div className="flex flex-col h-full min-w-[280px] w-[280px]">
      {/* Column header */}
      <div className="flex items-center justify-between px-2 py-2 mb-1">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              state === 'backlog'
                ? 'bg-text-muted'
                : state === 'todo'
                ? 'bg-text-secondary'
                : state === 'in_progress'
                ? 'bg-accent'
                : state === 'done'
                ? 'bg-success'
                : 'bg-danger'
            }`}
          />
          <span className="text-xs font-medium text-text-secondary uppercase tracking-wider">
            {title}
          </span>
          <span className="text-xs text-text-muted">{issues.length}</span>
        </div>
      </div>

      {/* Cards */}
      <div
        className="flex-1 overflow-y-auto px-1 space-y-2"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {issues.map((issue) => (
          <div
            key={issue.id}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('issueId', issue.id)
            }}
          >
            <IssueCard issue={issue} onClick={() => onIssueClick(issue)} draggable />
          </div>
        ))}
      </div>
    </div>
  )
}
