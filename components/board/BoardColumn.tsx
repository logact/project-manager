'use client'

import { useState } from 'react'
import IssueCard from '../issue/IssueCard'
import type { Issue, IssueState } from '../../types'

interface BoardColumnProps {
  state: IssueState
  title: string
  issues: Issue[]
  onIssueClick: (issue: Issue) => void
  onDrop: (issueId: string, newState: IssueState, targetIndex: number) => void
}

export default function BoardColumn({ state, title, issues, onIssueClick, onDrop }: BoardColumnProps) {
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const calculateInsertIndex = (e: React.DragEvent<HTMLDivElement>) => {
    const cards = e.currentTarget.querySelectorAll('[data-issue-id]')
    if (cards.length === 0) return 0

    let index = 0
    for (const card of cards) {
      const rect = card.getBoundingClientRect()
      const mid = rect.top + rect.height / 2
      if (e.clientY > mid) {
        index++
      } else {
        break
      }
    }
    return index
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverIndex(calculateInsertIndex(e))
  }

  const handleDragLeave = () => {
    setDragOverIndex(null)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const issueId = e.dataTransfer.getData('issueId')
    if (issueId) {
      const targetIndex = dragOverIndex ?? calculateInsertIndex(e)
      onDrop(issueId, state, targetIndex)
    }
    setDragOverIndex(null)
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
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {issues.map((issue, index) => (
          <div key={issue.id}>
            {dragOverIndex === index && (
              <div className="h-0.5 bg-accent rounded my-1" />
            )}
            <div
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('issueId', issue.id)
              }}
            >
              <IssueCard issue={issue} onClick={() => onIssueClick(issue)} draggable />
            </div>
          </div>
        ))}
        {dragOverIndex === issues.length && (
          <div className="h-0.5 bg-accent rounded my-1" />
        )}
      </div>
    </div>
  )
}
