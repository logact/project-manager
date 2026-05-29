import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  Layers,
  FolderKanban,
  Settings,
  ChevronDown,
  ChevronRight,
  Plus,
  Inbox,
  CircleDot,
} from 'lucide-react'
import { useTeams } from '../../hooks/useTeams'
import { useProjects } from '../../hooks/useProjects'
import { cn } from '../../lib/utils'
import CreateTeamModal from '../team/CreateTeamModal'
import CreateProjectModal from '../project/CreateProjectModal'

export default function Sidebar() {
  const teams = useTeams()
  const location = useLocation()
  const [expandedTeams, setExpandedTeams] = useState<Set<string>>(new Set())
  const [showTeamModal, setShowTeamModal] = useState(false)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [projectModalTeamId, setProjectModalTeamId] = useState<string | undefined>(undefined)

  // Auto-expand team when on its page or a project within it
  useEffect(() => {
    const path = location.pathname
    const teamMatch = path.match(/\/team\/([^/]+)/)
    const projectMatch = path.match(/\/project\/([^/]+)/)

    if (teamMatch) {
      setExpandedTeams((prev) => new Set([...prev, teamMatch[1]]))
    } else if (projectMatch) {
      // TODO: Find which team the project belongs to and expand that team
      // For now, we expand all teams when on a project page
      const allTeamIds = new Set(teams.map((t) => t.id))
      setExpandedTeams((prev) => new Set([...prev, ...allTeamIds]))
    }
  }, [location.pathname, teams])

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
            <NavLink
              to="/board"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                  isActive
                    ? 'bg-bg-tertiary text-text'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text'
                )
              }
            >
              <Inbox className="w-4 h-4" />
              <span>All Issues</span>
            </NavLink>
          </div>

          <div className="px-2 mb-2">
            <NavLink
              to="/active"
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
                  isActive
                    ? 'bg-bg-tertiary text-text'
                    : 'text-text-secondary hover:bg-bg-hover hover:text-text'
                )
              }
            >
              <CircleDot className="w-4 h-4" />
              <span>Active</span>
            </NavLink>
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
              />
            ))}
          </div>
        </nav>

        {/* Bottom actions */}
        <div className="border-t border-border p-2">
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
}: {
  team: { id: string; name: string; key: string; color: string }
  isExpanded: boolean
  onToggle: () => void
  onCreateProject: () => void
}) {
  const projects = useProjects(team.id)

  return (
    <div className="px-2 mb-0.5">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 w-full px-2 py-1.5 rounded text-sm text-text-secondary hover:bg-bg-hover hover:text-text transition-colors"
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

      {isExpanded && (
        <div className="ml-5 mt-0.5">
          <NavLink
            to={`/team/${team.id}`}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors',
                isActive
                  ? 'bg-bg-tertiary text-text'
                  : 'text-text-muted hover:bg-bg-hover hover:text-text'
              )
            }
          >
            <CircleDot className="w-3.5 h-3.5" />
            <span>Issues</span>
          </NavLink>

          {projects.map((project) => (
            <NavLink
              key={project.id}
              to={`/project/${project.id}`}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2 px-2 py-1 rounded text-sm transition-colors',
                  isActive
                    ? 'bg-bg-tertiary text-text'
                    : 'text-text-muted hover:bg-bg-hover hover:text-text'
                )
              }
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span className="truncate">{project.name}</span>
            </NavLink>
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
