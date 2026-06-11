'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from './Sidebar'
import CommandPalette from '../command/CommandPalette'
import IssueModal from '../issue/IssueModal'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [showPalette, setShowPalette] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  const projectId = pathname.match(/\/project\/([^\/]+)/)?.[1]

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setShowPalette((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <>
      <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>

      {showPalette && (
        <CommandPalette
          onClose={() => setShowPalette(false)}
          onCreateIssue={() => setShowCreateModal(true)}
        />
      )}

      {showCreateModal && (
        <IssueModal projectId={projectId} onClose={() => setShowCreateModal(false)} />
      )}
    </>
  )
}
