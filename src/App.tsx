import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import BoardView from './components/board/BoardView'
import ListView from './components/list/ListView'

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/board" replace />} />
        <Route path="/board" element={<BoardView title="All Issues" />} />
        <Route path="/list" element={<ListView title="All Issues" />} />
        <Route path="/active" element={<ListView title="Active Issues" />} />
        <Route path="/team/:teamId" element={<BoardView />} />
        <Route path="/team/:teamId/board" element={<BoardView />} />
        <Route path="/team/:teamId/list" element={<ListView />} />
        <Route path="/project/:projectId" element={<BoardView />} />
        <Route path="/project/:projectId/board" element={<BoardView />} />
        <Route path="/project/:projectId/list" element={<ListView />} />
      </Route>
    </Routes>
  )
}

export default App
