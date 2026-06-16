'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Trash2, Loader2, Copy, Check } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import MarkdownPreview from '../ui/MarkdownPreview'
import RichEditor from '../ui/RichEditor'
import PriorityIcon from './PriorityIcon'
import type { RichEditorHandle } from '../ui/RichEditor'
import { createIssue, updateIssue, deleteIssue, useIssue } from '../../hooks/useIssues'
import { useTeams } from '../../hooks/useTeams'
import { useProjects, useProject } from '../../hooks/useProjects'
import { useUsers } from '../../hooks/useUsers'
import { useLabels } from '../../hooks/useLabels'
import { cn } from '../../lib/utils'
import type { IssueState, Priority } from '../../types'

const states: IssueState[] = ['backlog', 'todo', 'in_progress', 'done', 'canceled']
const priorities: Priority[] = ['no_priority', 'low', 'medium', 'high', 'urgent']

export default function IssueModal({
  issueId,
  teamId,
  projectId: defaultProjectId,
  onClose,
  onSaved,
  onDeleted,
}: {
  issueId?: string
  teamId?: string
  projectId?: string
  onClose: () => void
  onSaved?: () => void
  onDeleted?: () => void
}) {
  const existingIssueQuery = useIssue(issueId)
  const existingIssue = existingIssueQuery.data
  const teamsQuery = useTeams()
  const teams = teamsQuery.data ?? []
  const usersQuery = useUsers()
  const users = usersQuery.data ?? []
  const defaultProjectQuery = useProject(defaultProjectId)
  const defaultProject = defaultProjectQuery.data
  const [selectedTeamId, setSelectedTeamId] = useState(teamId || teams[0]?.id || '')
  const projectsQuery = useProjects(selectedTeamId)
  const projects = projectsQuery.data ?? []
  const labelsQuery = useLabels(selectedTeamId)
  const labels = labelsQuery.data ?? []

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [state, setState] = useState<IssueState>('todo')
  const [priority, setPriority] = useState<Priority>('medium')
  const [assigneeId, setAssigneeId] = useState<string | undefined>(undefined)
  const [projectId, setProjectId] = useState<string | undefined>(undefined)
  const [selectedLabelIds, setSelectedLabelIds] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [copied, setCopied] = useState(false)
  const titleRef = useRef<HTMLInputElement>(null)
  const editorRef = useRef<RichEditorHandle>(null)

  useEffect(() => {
    if (existingIssue) {
      setTitle(existingIssue.title)
      setDescription(existingIssue.description || '')
      setState(existingIssue.state)
      setPriority(existingIssue.priority)
      setAssigneeId(existingIssue.assigneeId)
      setProjectId(existingIssue.projectId)
      setSelectedLabelIds(existingIssue.labelIds)
      setSelectedTeamId(existingIssue.teamId)
      editorRef.current?.setMarkdown(existingIssue.description || '')
    }
  }, [existingIssue])

  useEffect(() => {
    titleRef.current?.focus()
  }, [])

  // Auto-fill team and project when defaultProjectId is provided
  useEffect(() => {
    if (defaultProjectId && defaultProject && !existingIssue) {
      setSelectedTeamId(defaultProject.teamId)
      setProjectId(defaultProjectId)
    }
  }, [defaultProjectId, defaultProject, existingIssue])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [title, state, priority, assigneeId, projectId, selectedLabelIds, selectedTeamId])

  const handleSubmit = async () => {
    if (!title.trim() || !selectedTeamId || isSubmitting) return

    setIsSubmitting(true)
    try {
      const desc = editorRef.current?.getMarkdown().trim() || undefined
      if (existingIssue) {
        await updateIssue(existingIssue.id, {
          title: title.trim(),
          description: desc,
          state,
          priority,
          assigneeId,
          projectId,
          labelIds: selectedLabelIds,
          teamId: selectedTeamId,
        })
      } else {
        await createIssue({
          title: title.trim(),
          description: desc,
          state,
          priority,
          assigneeId,
          projectId,
          cycleId: undefined,
          teamId: selectedTeamId,
          labelIds: selectedLabelIds,
        })
      }

      onSaved?.()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!existingIssue || isDeleting) return
    if (!confirm(`Delete ${existingIssue.identifier}?`)) return

    setIsDeleting(true)
    try {
      await deleteIssue(existingIssue.id)
      onDeleted?.()
      onClose()
    } finally {
      setIsDeleting(false)
    }
  }

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    )
  }

  const switchMode = useCallback((newMode: 'edit' | 'preview') => {
    if (newMode === 'preview') {
      const md = editorRef.current?.getMarkdown() || ''
      setDescription(md)
    }
    setMode(newMode)
  }, [])

  const handleCopyMarkdown = async () => {
    const md = editorRef.current?.getMarkdown() || ''
    if (!md.trim()) return
    try {
      await navigator.clipboard.writeText(md)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = md
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-bg-secondary border border-border rounded-lg shadow-xl w-[640px] max-w-[90vw] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-text">
            {existingIssue ? `Edit ${existingIssue.identifier}` : 'New Issue'}
          </span>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text p-1 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Title */}
          <div className="mb-4">
            <Input
              ref={titleRef}
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
              className="text-base font-medium"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[11px] text-text-muted uppercase tracking-wider">Description</label>
              <div className="flex items-center gap-2">
                <div className="flex rounded border border-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => switchMode('edit')}
                    disabled={isSubmitting}
                    className={cn(
                      'px-2 py-0.5 text-[11px] font-medium transition-colors',
                      mode === 'edit' ? 'bg-accent-bg text-accent' : 'text-text-muted hover:text-text'
                    )}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => switchMode('preview')}
                    disabled={isSubmitting}
                    className={cn(
                      'px-2 py-0.5 text-[11px] font-medium transition-colors border-l border-border',
                      mode === 'preview' ? 'bg-accent-bg text-accent' : 'text-text-muted hover:text-text'
                    )}
                  >
                    Preview
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleCopyMarkdown}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium text-text-muted hover:text-text transition-colors rounded border border-border"
                  title="Copy markdown to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-green-500" />
                      <span className="text-green-500">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {mode === 'edit' ? (
              <RichEditor
                ref={editorRef}
                placeholder="Add description... (paste or drop images here)"
              />
            ) : (
              <div className={cn(
                'w-full bg-bg-secondary border border-border rounded px-3 py-2 text-sm min-h-[120px] max-h-[320px] overflow-y-auto'
              )}>
                {description.trim() ? (
                  <MarkdownPreview markdown={description} />
                ) : (
                  <span className="text-text-muted italic">No description</span>
                )}
              </div>
            )}
          </div>

          {/* Properties grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Team */}
            {!issueId && (
              <div>
                <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Team</label>
                <select
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* State */}
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as IssueState)}
                disabled={isSubmitting}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {states.map((s) => (
                  <option key={s} value={s}>
                    {s.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Priority</label>
              <div className="flex gap-1">
                {priorities.map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    disabled={isSubmitting}
                    className={cn(
                      'p-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
                      priority === p ? 'bg-accent-bg' : 'hover:bg-bg-hover'
                    )}
                  >
                    <PriorityIcon priority={p} size="sm" />
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee */}
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Assignee</label>
              <select
                value={assigneeId || ''}
                onChange={(e) => setAssigneeId(e.target.value || undefined)}
                disabled={isSubmitting}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Project */}
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Project</label>
              <select
                value={projectId || ''}
                onChange={(e) => setProjectId(e.target.value || undefined)}
                disabled={isSubmitting}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">No project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Labels */}
          <div className="mt-4">
            <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Labels</label>
            <div className="flex flex-wrap gap-1">
              {labels.map((label) => (
                <button
                  type="button"
                  key={label.id}
                  onClick={() => toggleLabel(label.id)}
                  disabled={isSubmitting}
                  className={cn(
                    'px-2 py-0.5 rounded text-[11px] font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                    selectedLabelIds.includes(label.id)
                      ? 'border'
                      : 'opacity-50 hover:opacity-80 border border-transparent'
                  )}
                  style={{
                    backgroundColor: label.color + '20',
                    color: label.color,
                    borderColor: selectedLabelIds.includes(label.id) ? label.color : 'transparent',
                  }}
                >
                  {label.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-text-muted">
            Cmd + Enter to save
          </span>
          <div className="flex gap-2">
            {existingIssue && (
              <Button variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting || isSubmitting}>
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting || isDeleting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!title.trim() || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{existingIssue ? 'Updating...' : 'Creating...'}</span>
                </>
              ) : (
                existingIssue ? 'Update' : 'Create Issue'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
