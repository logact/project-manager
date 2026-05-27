import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { seedDatabase } from '../../db/seeds'
import Sidebar from './Sidebar'

export default function AppLayout() {
  useEffect(() => {
    seedDatabase().catch(console.error)
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
