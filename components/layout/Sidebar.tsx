'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Layers,
  FolderKanban,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Inbox,
  CircleDot,
  Trash2,
} from 'lucide-react'
import TimerWidget from '../timer/TimerWidget'
import { useTeams, deleteTeam } from '../../hooks/useTeams'
import { useProjects, deleteProject } from '../../hooks/useProjects'
import { cn } from '../../lib/utils'
import CreateTeamModal from '../team/CreateTeamModal'
import CreateProjectModal from '../project/CreateProjectModal'

export default function Sidebar() {
  const teamsQuery = useTeams()
  const teams = teamsQuery.data ?? []
  const pathname = usePathname()
  const router = useRouter()
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectModalTeamId, setProjectModalTeamId] = useState<string | undefined>(undefined)

  const handleDeleteTeam = async (teamId: string, teamName: string) => {
    if (!confirm(`Delete team "${teamName}"? This will also delete all issues, projects, and labels in this team.`)) return
    await deleteTeam(teamId)
    if (pathname.includes(`/team/${teamId}`) || pathname.includes(`/project/`)) {
      router.push('/board')
    }
  }

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (!confirm(`Delete project "${projectName}"?`)) return
    await deleteProject(projectId)
    if (pathname.includes(`/project/${projectId}`)) {
      router.push('/board')
    }
  }

  // Auto-expand team when on its page or a project within it
  useEffect(() => {
    const teamMatch = pathname.match(/\/team\/([^/]+)/)
    const projectMatch = pathname.match(/\/project\/([^/]+)/)

    if (teamMatch) {
      setExpandedTeams((prev) => new Set([...prev, teamMatch[1]]))
    } else if (projectMatch) {
      // TODO: Find which team the project belongs to and expand that team
      // For now, we expand all teams when on a project page
      const allTeamIds = new Set(teams.map((t) => t.id))
      setExpandedTeams((prev) => new Set([...prev, ...allTeamIds]))
    }
  }, [pathname, teams])

  const toggleTeam = (teamId: string) => {
    setExpandedTeams((prev) => {
      const next = new Set(prev)
      if (next.has(teamId)) next.delete(teamId)
      else next.add(teamId)
      return next
    })
  }

  const openProjectModal = (teamId: string) => {
    setProjectModalTeamId(teamId)
    setShowProjectModal(true)
  }

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <>
      <aside className="w-56 bg-bg-secondary border-r border-border flex flex-col flex-shrink-0">
        {/* Workspace header */}
        <div className="h-10 flex items-center px-3 border-b border-border">
          <div className="flex items-center gap-2 text-text font-medium text-sm">
            <Layers className="w-4 h-4 text-accent" />
            <span>Workspace</span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="px-2 mb-2">
            <Link
              href="/board"
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                isActive('/board')
                  ? 'bg-bg-tertiary text-text'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text'
              )}
            >
              <Inbox className="w-4 h-4" />
              <span>All Issues</span>
            </Link>
          </div>

          <div className="px-2 mb-2">
            <Link
              href="/active"
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                isActive('/active')
                  ? 'bg-bg-tertiary text-text'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text'
              )}
            >
              <CircleDot className="w-4 h-4" />
              <span>Active</span>
            </Link>
          </div>

          {/* Teams */}
          <div className="mt-4">
            <div className="px-3 mb-1 flex items-center justify-between">
              <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                Teams
              </span>
              <button
                onClick={() => setShowTeamModal(true)}
                className="text-text-muted hover:text-text p-0.5 rounded"
                title="Create team"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {teams.map((team) => (
              <TeamSection
                key={team.id}
                team={team}
                isExpanded={expandedTeams.has(team.id)}
                onToggle={() => toggleTeam(team.id)}
                onCreateProject={() => openProjectModal(team.id)}
                onDeleteTeam={() => handleDeleteTeam(team.id, team.name)}
                onDeleteProject={handleDeleteProject}
              />
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border p-2 space-y-1">
          <TimerWidget />
          <button className="flex items-center gap-2 px-2 py-1.5 rounded text-sm text-text-secondary hover:bg-bg-hover hover:text-text transition-colors w-full">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {showTeamModal && <CreateTeamModal onClose={() => setShowTeamModal(false)} />}
      {showProjectModal && (
        <CreateProjectModal
          defaultTeamId={projectModalTeamId}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </>
  )
}

function TeamSection({
  team,
  isExpanded,
  onToggle,
  onCreateProject,
  onDeleteTeam,
  onDeleteProject,
}: {
  team: { id: string; name: string; key: string; color: string }
  isExpanded: boolean
  onToggle: () => void
  onCreateProject: () => void
  onDeleteTeam: () => void
  onDeleteProject: (projectId: string, projectName: string) => void
}) {
  const projectsQuery = useProjects(team.id)
  const projects = projectsQuery.data ?? []
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <div className="px-2 mb-0.5">
      <div className="flex items-center gap-1 group">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 flex-1 px-2 py-1.5 rounded text-sm text-text-secondary hover:bg-bg-hover hover:text-text transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5" />
          )}
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: team.color }}
          />
          <span className="truncate">{team.name}</span>
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDeleteTeam() }}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-muted hover:text-danger hover:bg-danger-bg transition-all"
          title="Delete team"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {isExpanded && (
        <div className="ml-5 mt-0.5">
          <Link
            href={`/team/${team.id}`}
            className={cn(
              'flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors',
              isActive(`/team/${team.id}`)
                ? 'bg-bg-tertiary text-text'
                : 'text-text-muted hover:bg-bg-hover hover:text-text'
            )}
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Issues</span>
          </Link>

          {projects.map((project) => (
            <div key={project.id} className="flex items-center gap-1 group/project">
              <Link
                href={`/project/${project.id}`}
                className={cn(
                  'flex items-center gap-2 flex-1 px-2 py-1 rounded text-sm transition-colors',
                  isActive(`/project/${project.id}`)
                    ? 'bg-bg-tertiary text-text'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text'
                )}
              >
                <FolderKanban className="w-3.5 h-3.5" />
                <span className="truncate">{project.name}</span>
              </Link>
              <button
                onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id, project.name) }}
                className="opacity-0 group-hover/project:opacity-100 p-1 rounded text-text-muted hover:text-danger hover:bg-danger-bg transition-all"
                title="Delete project"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}

          <button
            onClick={onCreateProject}
            className="flex items-center gap-2 w-full px-2 py-1 rounded text-sm text-text-muted hover:bg-bg-hover hover:text-text transition-colors mt-0.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add project</span>
          </button>
        </div>
      )}
    </div>
  )
}
