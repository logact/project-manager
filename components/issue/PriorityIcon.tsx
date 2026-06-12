import { SignalHigh, SignalMedium, SignalLow, Minus } from 'lucide-react'
import { cn } from '../../lib/utils'
import type { Priority } from '../../types'

export const priorityConfig: Record<Priority, { icon: React.ElementType; color: string; label: string }> = {
  urgent: { icon: SignalHigh, color: 'text-priority-urgent', label: 'Urgent' },
  high: { icon: SignalHigh, color: 'text-priority-high', label: 'High' },
  medium: { icon: SignalMedium, color: 'text-priority-medium', label: 'Medium' },
  low: { icon: SignalLow, color: 'text-priority-low', label: 'Low' },
  no_priority: { icon: Minus, color: 'text-text-muted', label: 'No priority' },
}

export default function PriorityIcon({
  priority,
  size = 'sm',
  className,
}: {
  priority: Priority
  size?: 'xs' | 'sm' | 'md'
  className?: string
}) {
  const config = priorityConfig[priority]
  const Icon = config.icon
  const sizeClass = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size]

  return (
    <span title={config.label} className={cn(config.color, sizeClass, className)}>
      <Icon className="w-full h-full" />
    </span>
  )
}
