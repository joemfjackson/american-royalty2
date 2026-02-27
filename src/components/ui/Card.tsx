import { forwardRef, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Enable a subtle glow + border color shift on hover */
  hover?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl border border-dark-border bg-dark-card p-6',
          hover &&
            '-translate-y-0.5 border-royal/20 shadow-[0_8px_30px_rgba(111,45,189,0.18),0_2px_8px_rgba(0,0,0,0.4)] transition-all duration-300 sm:translate-y-0 sm:border-dark-border sm:shadow-none sm:hover:-translate-y-1 sm:hover:border-royal/30 sm:hover:shadow-[0_12px_40px_rgba(111,45,189,0.2),0_4px_12px_rgba(0,0,0,0.4)]',
          className,
        )}
        {...props}
      />
    )
  },
)

Card.displayName = 'Card'

export { Card }
export default Card
