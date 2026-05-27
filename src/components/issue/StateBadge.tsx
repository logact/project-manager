import { cn } from '../../lib/utils'
import type { IssueState } from '../../types'

const stateConfig: Record<IssueState, { label: string; dotColor: string }> = {
  backlog: { label: 'Backlog', dotColor: 'bg-text-muted' },
  todo: { label: 'Todo', dotColor: 'bg-text-secondary' },
  in_progress: { label: 'In Progress', dotColor: 'bg-accent' },
  done: { label: 'Done', dotColor: 'bg-success' },
  canceled: { label: 'Canceled', dotColor: 'bg-danger' },
}

export default function StateBadge({
  state,
  className,
}: {
  state: IssueState
  className?: string
}) {
  const config = stateConfig[state]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs text-text-secondary',
        className
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', config.dotColor)} />
      {config.label}
    </span>
  )
}
