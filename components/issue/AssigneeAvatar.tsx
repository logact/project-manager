import { cn } from '../../lib/utils'
import { useUser } from '../../hooks/useUsers'

export default function AssigneeAvatar({
  userId,
  size = 'sm',
  className,
}: {
  userId: string | undefined
  size?: 'xs' | 'sm' | 'md'
  className?: string
}) {
  const userQuery = useUser(userId)
  const user = userQuery.data
  const sizeClass = {
    xs: 'w-5 h-5 text-[9px]',
    sm: 'w-6 h-6 text-[10px]',
    md: 'w-8 h-8 text-xs',
  }[size]

  if (!user) {
    return (
      <div
        className={cn(
          'rounded-full bg-bg-tertiary border border-border flex items-center justify-center',
          sizeClass,
          className
        )}
        title="Unassigned"
      />
    )
  }

  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'rounded-full bg-accent/20 text-accent border border-accent/30 flex items-center justify-center font-medium',
        sizeClass,
        className
      )}
      title={user.name}
    >
      {initials}
    </div>
  )
}
