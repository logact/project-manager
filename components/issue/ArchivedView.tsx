'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArchiveRestore, Loader2, ArrowUpDown } from 'lucide-react'
import Button from '../ui/Button'
import PriorityIcon from '../issue/PriorityIcon'
import AssigneeAvatar from '../issue/AssigneeAvatar'
import StateBadge from '../issue/StateBadge'
import { useIssues, unarchiveIssue } from '../../hooks/useIssues'
import { useUser } from '../../hooks/useUsers'
import { useProject } from '../../hooks/useProjects'
import { formatDate } from '../../lib/utils'
import type { Issue } from '../../types'

export default function ArchivedView() {
  const router = useRouter()
  const issuesQuery = useIssues({ archived: true })
  const issues = issuesQuery.data ?? []

  const [sortField, setSortField] = useState<'priority' | 'updatedAt' | 'archivedAt'>('archivedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')

  const filteredIssues = useMemo(() => {
    return [...issues].sort((a, b) => {
      let cmp = 0
      if (sortField === 'priority') {
        const order = ['no_priority', 'low', 'medium', 'high', 'urgent']
        cmp = order.indexOf(b.priority) - order.indexOf(a.priority)
      } else {
        cmp = (b[sortField] ?? 0) - (a[sortField] ?? 0)
      }
      return sortDir === 'asc' ? -cmp : cmp
    })
  }, [issues, sortField, sortDir])

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
          <h1 className="text-base font-medium text-text">Archived Issues</h1>
          <span className="text-xs text-text-muted">{filteredIssues.length} issues</span>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        {filteredIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-text-muted">
            <span className="text-sm">No archived issues</span>
          </div>
        ) : (
          <div className="min-w-[800px]">
            {/* Table header */}
            <div className="grid grid-cols-[1fr_100px_80px_80px_120px_120px_100px_80px] gap-2 px-5 py-2 border-b border-border text-[11px] text-text-muted uppercase tracking-wider">
              <span>Title</span>
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
              <span>Archived</span>
              <button
                onClick={() => toggleSort('archivedAt')}
                className="text-left flex items-center gap-1 hover:text-text transition-colors"
              >
                Date
                <ArrowUpDown className="w-3 h-3" />
              </button>
              <span></span>
            </div>

            {/* Table rows */}
            {filteredIssues.map((issue) => (
              <ArchivedRow
                key={issue.id}
                issue={issue}
                onClick={() => router.push(`/issue/${issue.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ArchivedRow({
  issue,
  onClick,
}: {
  issue: Issue
  onClick: () => void
}) {
  const assigneeQuery = useUser(issue.assigneeId)
  const assignee = assigneeQuery.data
  const projectQuery = useProject(issue.projectId)
  const project = projectQuery.data
  const [isUnarchiving, setIsUnarchiving] = useState(false)

  const handleUnarchive = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setIsUnarchiving(true)
    try {
      await unarchiveIssue(issue.id)
    } finally {
      setIsUnarchiving(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className="grid grid-cols-[1fr_100px_80px_80px_120px_120px_100px_80px] gap-2 px-5 py-2.5 border-b border-border-subtle hover:bg-bg-hover cursor-pointer transition-colors items-center"
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

      <div className="text-xs text-text-muted truncate">
        {issue.archivedAt ? formatDate(issue.archivedAt) : '—'}
      </div>

      <div className="text-xs text-text-muted">
        {formatDate(issue.updatedAt)}
      </div>

      <div>
        <button
          onClick={handleUnarchive}
          disabled={isUnarchiving}
          className="p-1.5 rounded text-text-muted hover:text-accent hover:bg-accent-bg transition-colors disabled:opacity-50"
          title="Restore from archive"
        >
          {isUnarchiving ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ArchiveRestore className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  )
}
