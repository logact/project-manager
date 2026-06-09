'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, LayoutGrid, List, FolderKanban, CircleDot } from 'lucide-react'
import { useIssues } from '../../hooks/useIssues'
import { useTeams } from '../../hooks/useTeams'
import { useProjects } from '../../hooks/useProjects'
import { cn } from '../../lib/utils'

interface CommandItem {
  id: string
  icon: React.ReactNode
  label: string
  subtitle?: string
  shortcut?: string
  action: () => void
}

export default function CommandPalette({
  onClose,
  onCreateIssue,
}: {
  onClose: () => void
  onCreateIssue?: () => void
}) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const teamsQuery = useTeams()
  const teams = teamsQuery.data ?? []
  const projectsQuery = useProjects()
  const projects = projectsQuery.data ?? []
  const allIssuesQuery = useIssues()
  const allIssues = allIssuesQuery.data ?? []

  const filteredIssues = useMemo(() => {
    if (!query.trim()) return allIssues.slice(0, 5)
    const q = query.toLowerCase()
    return allIssues
      .filter(
        (i) =>
          i.title.toLowerCase().includes(q) ||
          i.identifier.toLowerCase().includes(q)
      )
      .slice(0, 8)
  }, [query, allIssues])

  const commands: CommandItem[] = useMemo(() => {
    const items: CommandItem[] = []

    // Navigation commands
    items.push({
      id: 'nav-board',
      icon: <LayoutGrid className="w-4 h-4" />,
      label: 'Board View',
      subtitle: 'Switch to board view',
      action: () => {
        router.push('/board')
        onClose()
      },
    })

    items.push({
      id: 'nav-list',
      icon: <List className="w-4 h-4" />,
      label: 'List View',
      subtitle: 'Switch to list view',
      action: () => {
        router.push('/list')
        onClose()
      },
    })

    // Create commands
    if (onCreateIssue) {
      items.push({
        id: 'create-issue',
        icon: <Plus className="w-4 h-4" />,
        label: 'Create Issue',
        subtitle: 'Create a new issue',
        shortcut: 'C',
        action: () => {
          onCreateIssue()
          onClose()
        },
      })
    }

    // Team navigation
    teams.forEach((team) => {
      items.push({
        id: `team-${team.id}`,
        icon: (
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: team.color }}
          />
        ),
        label: team.name,
        subtitle: 'Team',
        action: () => {
          router.push(`/team/${team.id}`)
          onClose()
        },
      })
    })

    // Project navigation
    projects.forEach((project) => {
      items.push({
        id: `project-${project.id}`,
        icon: <FolderKanban className="w-4 h-4" />,
        label: project.name,
        subtitle: 'Project',
        action: () => {
          router.push(`/project/${project.id}`)
          onClose()
        },
      })
    })

    return items
  }, [router, onClose, onCreateIssue, teams, projects])

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands
    const q = query.toLowerCase()
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) ||
        c.subtitle?.toLowerCase().includes(q)
    )
  }, [query, commands])

  const allItems = useMemo(() => {
    const issueItems: CommandItem[] = filteredIssues.map((issue) => ({
      id: `issue-${issue.id}`,
      icon: <CircleDot className="w-4 h-4 text-text-muted" />,
      label: issue.title,
      subtitle: issue.identifier,
      action: () => {
        router.push(`/team/${issue.teamId}`)
        onClose()
      },
    }))
    return [...issueItems, ...filteredCommands]
  }, [filteredIssues, filteredCommands, router, onClose])

  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        return
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((i) => Math.min(i + 1, allItems.length - 1))
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((i) => Math.max(i - 1, 0))
      }
      if (e.key === 'Enter') {
        e.preventDefault()
        const item = allItems[selectedIndex]
        if (item) item.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [allItems, selectedIndex, onClose])

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex]
    if (el) {
      el.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-bg-secondary border border-border rounded-lg shadow-2xl w-[560px] max-w-[90vw] overflow-hidden flex flex-col">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search issues, teams, projects..."
            className="flex-1 bg-transparent text-sm text-text placeholder:text-text-muted outline-none"
          />
          <kbd className="px-1.5 py-0.5 bg-bg-tertiary border border-border rounded text-[10px] text-text-muted font-mono">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-[400px] overflow-y-auto py-1">
          {query.trim() && filteredIssues.length > 0 && (
            <div className="px-3 py-1">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                Issues
              </span>
            </div>
          )}

          {filteredIssues.map((issue, idx) => (
            <button
              key={issue.id}
              onClick={() => {
                router.push(`/team/${issue.teamId}`)
                onClose()
              }}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                idx === selectedIndex ? 'bg-accent-bg' : 'hover:bg-bg-hover'
              )}
            >
              <CircleDot className="w-4 h-4 text-text-muted flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm text-text truncate">{issue.title}</div>
                <div className="text-xs text-text-muted">{issue.identifier}</div>
              </div>
            </button>
          ))}

          {filteredCommands.length > 0 && query.trim() && filteredIssues.length > 0 && (
            <div className="px-3 py-1 mt-1 border-t border-border-subtle">
              <span className="text-[10px] text-text-muted uppercase tracking-wider">
                Commands
              </span>
            </div>
          )}

          {filteredCommands.map((cmd, idx) => {
            const actualIndex = filteredIssues.length + idx
            return (
              <button
                key={cmd.id}
                onClick={cmd.action}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-2 text-left transition-colors',
                  actualIndex === selectedIndex ? 'bg-accent-bg' : 'hover:bg-bg-hover'
                )}
              >
                <span className="text-text-muted flex-shrink-0">{cmd.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text truncate">{cmd.label}</div>
                  {cmd.subtitle && (
                    <div className="text-xs text-text-muted">{cmd.subtitle}</div>
                  )}
                </div>
                {cmd.shortcut && (
                  <kbd className="px-1.5 py-0.5 bg-bg-tertiary border border-border rounded text-[10px] text-text-muted font-mono">
                    {cmd.shortcut}
                  </kbd>
                )}
              </button>
            )
          })}

          {allItems.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-text-muted">
              No results found
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-bg-tertiary/50">
          <div className="flex items-center gap-3 text-[10px] text-text-muted">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-bg-tertiary border border-border rounded font-mono">↑↓</kbd> to navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-bg-tertiary border border-border rounded font-mono">↵</kbd> to select
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
