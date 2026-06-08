import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { createProject } from '../../hooks/useProjects'
import { useTeams } from '../../hooks/useTeams'
import type { ProjectState } from '../../types'

const states: ProjectState[] = ['planned', 'started', 'paused', 'completed', 'canceled']

export default function CreateProjectModal({
  defaultTeamId,
  onClose,
}: {
  defaultTeamId?: string
  onClose: () => void
}) {
  const teamsQuery = useTeams()
  const teams = teamsQuery.data ?? []
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [teamId, setTeamId] = useState(defaultTeamId || teams[0]?.id || '')
  const [state, setState] = useState<ProjectState>('planned')
  const [startDate, setStartDate] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (defaultTeamId) setTeamId(defaultTeamId)
  }, [defaultTeamId])

  useEffect(() => {
    nameRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSubmit()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [name, description, teamId, state, startDate, targetDate])

  const handleSubmit = async () => {
    if (!name.trim() || !teamId) return
    await createProject({
      name: name.trim(),
      description: description.trim() || undefined,
      teamId,
      state,
      startDate: startDate ? new Date(startDate).getTime() : undefined,
      targetDate: targetDate ? new Date(targetDate).getTime() : undefined,
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-bg-secondary border border-border rounded-lg shadow-xl w-[520px] max-w-[90vw] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-text">New Project</span>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Name</label>
            <Input
              ref={nameRef}
              placeholder="Q3 Roadmap"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Description</label>
            <textarea
              placeholder="What is this project about?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full bg-bg-secondary border border-border rounded px-3 py-2 text-sm text-text placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 resize-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text"
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value as ProjectState)}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text"
              >
                {states.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text"
              />
            </div>

            <div>
              <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Target Date</label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full bg-bg-tertiary border border-border rounded px-2 py-1.5 text-sm text-text"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-text-muted">Cmd + Enter to save</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!name.trim() || !teamId}>
              Create Project
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
