import { useState, useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { createTeam } from '../../hooks/useTeams'

const presetColors = [
  '#5e6ad2', '#e8a838', '#4da35a', '#d13b3b', '#7c4dff',
  '#00bcd4', '#ff5722', '#9c27b0', '#3f51b5', '#009688',
]

export default function CreateTeamModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState('')
  const [key, setKey] = useState('')
  const [color, setColor] = useState(presetColors[0])
  const nameRef = useRef<HTMLInputElement>(null)

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
  }, [name, key, color])

  // Auto-generate key from name
  useEffect(() => {
    if (!key || key === generateKey(name.slice(0, -1))) {
      setKey(generateKey(name))
    }
  }, [name])

  const handleSubmit = async () => {
    if (!name.trim() || !key.trim()) return
    await createTeam({ name: name.trim(), key: key.trim().toUpperCase(), color })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50"
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-bg-secondary border border-border rounded-lg shadow-xl w-[480px] max-w-[90vw] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <span className="text-sm font-medium text-text">New Team</span>
          <button onClick={onClose} className="text-text-muted hover:text-text p-1 rounded transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Name</label>
            <Input
              ref={nameRef}
              placeholder="Engineering"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Key</label>
            <Input
              placeholder="ENG"
              value={key}
              onChange={(e) => setKey(e.target.value.toUpperCase())}
              maxLength={5}
            />
          </div>

          <div>
            <label className="text-[11px] text-text-muted uppercase tracking-wider mb-1 block">Color</label>
            <div className="flex flex-wrap gap-2">
              {presetColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                  style={{
                    backgroundColor: c,
                    borderColor: color === c ? 'white' : 'transparent',
                    boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-text-muted">Cmd + Enter to save</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!name.trim() || !key.trim()}>
              Create Team
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function generateKey(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 5)
}
