import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'gold' | 'purple' | 'outline' | 'green' | 'yellow' | 'red'

const variantStyles: Record<BadgeVariant, string> = {
  gold: 'bg-gold/25 text-gold border-gold/50',
  purple: 'bg-royal/25 text-royal-light border-royal/50',
  outline: 'bg-transparent text-gold border-gold/60',
  green: 'bg-emerald-500/25 text-emerald-400 border-emerald-500/50',
  yellow: 'bg-amber-500/25 text-amber-400 border-amber-500/50',
  red: 'bg-red-500/25 text-red-400 border-red-500/50',
}

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

function Badge({ className, variant = 'gold', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide',
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  )
}

Badge.displayName = 'Badge'

export { Badge }
export default Badge
