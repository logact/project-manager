import { useState, useRef, useEffect } from 'react'
import { Timer, Play, Pause, RotateCcw, X, Bell } from 'lucide-react'
import { useTimer } from '../../hooks/useTimer'
import { cn } from '../../lib/utils'

const PRESETS = [
  { label: '25m', seconds: 25 * 60 },
  { label: '15m', seconds: 15 * 60 },
  { label: '5m', seconds: 5 * 60 },
]

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

export default function TimerWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const { timeLeft, isRunning, toggle, reset } = useTimer()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors',
          isRunning
            ? 'text-accent bg-accent-bg'
            : 'text-text-secondary hover:bg-bg-hover hover:text-text'
        )}
        title="Focus timer"
      >
        <Timer className="w-4 h-4" />
        {isRunning && <span className="text-xs font-mono">{formatTime(timeLeft)}</span>}
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-56 bg-bg-secondary border border-border rounded-lg shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <span className="text-sm font-medium text-text">Focus Timer</span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 text-center">
            <div className={cn(
              'text-4xl font-mono font-medium mb-4',
              timeLeft <= 60 && timeLeft > 0 ? 'text-warning' : 'text-text'
            )}>
              {formatTime(timeLeft)}
            </div>

            <div className="flex items-center justify-center gap-2 mb-4">
              <button
                onClick={toggle}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-2 rounded text-sm font-medium transition-colors',
                  isRunning
                    ? 'bg-warning-bg text-warning hover:bg-warning/20'
                    : 'bg-accent-bg text-accent hover:bg-accent/20'
                )}
              >
                {isRunning ? (
                  <>
                    <Pause className="w-4 h-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" /> Start
                  </>
                )}
              </button>
              <button
                onClick={() => reset()}
                className="flex items-center gap-1.5 px-3 py-2 rounded text-sm text-text-secondary hover:bg-bg-hover transition-colors"
                title="Reset"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {PRESETS.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => reset(preset.seconds)}
                  className="px-2.5 py-1 rounded text-xs text-text-secondary hover:bg-bg-hover hover:text-text transition-colors border border-border"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {'Notification' in window && Notification.permission !== 'granted' && (
            <div className="px-3 py-2 bg-bg-tertiary/50 border-t border-border flex items-center gap-2">
              <Bell className="w-3 h-3 text-text-muted flex-shrink-0" />
              <span className="text-[11px] text-text-muted">
                Enable browser notifications to get alerts when timer ends
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
