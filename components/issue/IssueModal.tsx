'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { X, Trash2, Loader2, Copy, Check, Plus, Tag, Archive, ArchiveRestore } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import MarkdownPreview from '../ui/MarkdownPreview'
import RichEditor from '../ui/RichEditor'
import PriorityIcon from './PriorityIcon'
import type { RichEditorHandle } from '../ui/RichEditor'
import { createIssue, updateIssue, deleteIssue, archiveIssue, unarchiveIssue, useIssue } from '../../hooks/useIssues'
import { useTeams } from '../../hooks/useTeams'
import { useProjects, useProject } from '../../hooks/useProjects'
import { useUsers } from '../../hooks/useUsers'
import { useLabels, createLabel, deleteLabel } from '../../hooks/useLabels'
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
  const [showLabelDropdown, setShowLabelDropdown] = useState(false)
  const [isCreatingLabel, setIsCreatingLabel] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('#6366f1')
  const labelDropdownRef = useRef<HTMLDivElement>(null)
  const labelInputRef = useRef<HTMLInputElement>(null)
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

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (labelDropdownRef.current && !labelDropdownRef.current.contains(e.target as Node)) {
        setShowLabelDropdown(false)
      }
    }
    if (showLabelDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showLabelDropdown])

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

  const handleArchive = async () => {
    if (!existingIssue || isSubmitting) return
    setIsSubmitting(true)
    try {
      await archiveIssue(existingIssue.id)
      onSaved?.()
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnarchive = async () => {
    if (!existingIssue || isSubmitting) return
    setIsSubmitting(true)
    try {
      await unarchiveIssue(existingIssue.id)
      onSaved?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleLabel = (labelId: string) => {
    setSelectedLabelIds((prev) =>
      prev.includes(labelId) ? prev.filter((id) => id !== labelId) : [...prev, labelId]
    )
  }

  const handleCreateLabel = async () => {
    if (!newLabelName.trim() || !selectedTeamId) return
    setIsCreatingLabel(true)
    try {
      const label = await createLabel({
        name: newLabelName.trim(),
        color: newLabelColor,
        teamId: selectedTeamId,
      })
      setSelectedLabelIds((prev) => [...prev, label.id])
      setNewLabelName('')
      setNewLabelColor('#6366f1')
      labelInputRef.current?.focus()
    } finally {
      setIsCreatingLabel(false)
    }
  }

  const handleDeleteLabel = async (labelId: string) => {
    if (!confirm('Delete this label?')) return
    await deleteLabel(labelId)
    setSelectedLabelIds((prev) => prev.filter((id) => id !== labelId))
  }

  const toggleLabelDropdown = () => {
    setShowLabelDropdown((prev) => !prev)
    if (!showLabelDropdown) {
      setTimeout(() => labelInputRef.current?.focus(), 100)
    }
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
    const labelNames = labels
      .filter((label) => selectedLabelIds.includes(label.id))
      .map((label) => label.name)
      .join(', ')
    const issueId = existingIssue?.identifier || ''
    const formatted = [
      issueId ? `${issueId}:` : '',
      labelNames,
      title ? `${title}:` : '',
      md,
    ]
      .filter((line) => line !== undefined)
      .join('\n')
    if (!formatted.trim()) return
    try {
      await navigator.clipboard.writeText(formatted)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = formatted
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
          <div className="mt-4 relative" ref={labelDropdownRef}>
            <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Labels</label>
            <button
              type="button"
              onClick={toggleLabelDropdown}
              disabled={isSubmitting}
              className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-text-muted" />
                {selectedLabelIds.length === 0 ? (
                  <span className="text-text-muted">Select labels...</span>
                ) : (
                  <span className="text-text">
                    {selectedLabelIds.length} label{selectedLabelIds.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </span>
              <div className="flex items-center gap-1">
                {selectedLabelIds.length > 0 && (
                  <div className="flex -space-x-1">
                    {labels
                      .filter((l) => selectedLabelIds.includes(l.id))
                      .slice(0, 3)
                      .map((l) => (
                        <div
                          key={l.id}
                          className="w-3 h-3 rounded-full border border-bg-tertiary"
                          style={{ backgroundColor: l.color }}
                        />
                      ))}
                  </div>
                )}
                <svg className={`w-4 h-4 text-text-muted transition-transform ${showLabelDropdown ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            {showLabelDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-bg-secondary border border-border rounded-lg shadow-lg max-h-64 overflow-hidden flex flex-col">
                <div className="p-2 border-b border-border">
                  <div className="flex gap-1">
                    <input
                      ref={labelInputRef}
                      type="text"
                      value={newLabelName}
                      onChange={(e) => setNewLabelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleCreateLabel()
                        }
                      }}
                      placeholder="Create new label..."
                      disabled={isCreatingLabel}
                      className="flex-1 bg-bg-tertiary border border-border rounded px-2 py-1 text-xs text-text placeholder:text-text-muted disabled:opacity-50"
                    />
                    <input
                      type="color"
                      value={newLabelColor}
                      onChange={(e) => setNewLabelColor(e.target.value)}
                      className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
                    />
                    <button
                      type="button"
                      onClick={handleCreateLabel}
                      disabled={!newLabelName.trim() || isCreatingLabel}
                      className="p-1.5 rounded bg-accent-bg text-accent hover:bg-accent-bg/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isCreatingLabel ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  {labels.length === 0 ? (
                    <div className="px-3 py-4 text-center text-xs text-text-muted">
                      No labels yet. Create one above.
                    </div>
                  ) : (
                    labels.map((label) => (
                      <div
                        key={label.id}
                        className="flex items-center justify-between px-2 py-1.5 hover:bg-bg-hover group"
                      >
                        <button
                          type="button"
                          onClick={() => toggleLabel(label.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          <div
                            className={`w-3.5 h-3.5 rounded flex items-center justify-center transition-all ${
                              selectedLabelIds.includes(label.id)
                                ? 'bg-accent-bg'
                                : 'border border-border'
                            }`}
                          >
                            {selectedLabelIds.includes(label.id) && (
                              <Check className="w-2.5 h-2.5 text-accent" />
                            )}
                          </div>
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span className="text-xs text-text">{label.name}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLabel(label.id)}
                          className="p-1 rounded text-text-muted hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                          title="Delete label"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {selectedLabelIds.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {labels
                  .filter((label) => selectedLabelIds.includes(label.id))
                  .map((label) => (
                    <span
                      key={label.id}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium"
                      style={{
                        backgroundColor: label.color + '20',
                        color: label.color,
                      }}
                    >
                      {label.name}
                      <button
                        type="button"
                        onClick={() => toggleLabel(label.id)}
                        disabled={isSubmitting}
                        className="hover:opacity-70 disabled:cursor-not-allowed"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-text-muted">
            Cmd + Enter to save
          </span>
          <div className="flex gap-2">
            {existingIssue && (
              <>
                {existingIssue.archived ? (
                  <Button variant="ghost" size="sm" onClick={handleUnarchive} disabled={isSubmitting} title="Restore from archive">
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArchiveRestore className="w-3.5 h-3.5" />}
                  </Button>
                ) : (
                  <Button variant="ghost" size="sm" onClick={handleArchive} disabled={isSubmitting} title="Archive issue">
                    {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Archive className="w-3.5 h-3.5" />}
                  </Button>
                )}
                <Button variant="danger" size="sm" onClick={handleDelete} disabled={isDeleting || isSubmitting}>
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </Button>
              </>
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
