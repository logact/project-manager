import { useLabels } from '../../hooks/useLabels'
import PriorityIcon, { priorityConfig } from './PriorityIcon'
import AssigneeAvatar from './AssigneeAvatar'
import type { Issue } from '../../types'

export default function IssueCard({
  issue,
  onClick,
  draggable = false,
}: {
  issue: Issue
  onClick?: () => void
  draggable?: boolean
}) {
  const labelsQuery = useLabels(issue.teamId)
  const labels = labelsQuery.data ?? []
  const issueLabels = labels.filter((l) => issue.labelIds.includes(l.id))

  return (
    <div
      data-issue-id={issue.id}
      onClick={onClick}
      draggable={draggable}
      className={`group bg-bg-tertiary hover:bg-bg-hover border border-border border-l-2 rounded-md p-3 cursor-pointer transition-colors ${priorityConfig[issue.priority].color.replace('text-', 'border-l-')}`}
    >
      {/* Top row: priority + identifier */}
      <div className="flex items-center gap-2 mb-1.5">
        <PriorityIcon priority={issue.priority} size="xs" />
        <span className="text-[11px] text-text-muted font-mono">{issue.identifier}</span>
      </div>

      {/* Title */}
      <h4 className="text-sm text-text leading-snug mb-2">{issue.title}</h4>

      {/* Bottom row: labels + assignee */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 flex-wrap">
          {issueLabels.map((label) => (
            <span
              key={label.id}
              className="px-1.5 py-0.5 rounded text-[10px] font-medium"
              style={{
                backgroundColor: label.color + '20',
                color: label.color,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
        <AssigneeAvatar userId={issue.assigneeId} size="xs" />
      </div>
    </div>
  )
}
