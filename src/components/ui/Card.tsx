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
            '-translate-y-0.5 border-royal/20 shadow-[0_10px_40px_rgba(111,45,189,0.35),0_4px_15px_rgba(111,45,189,0.2),0_2px_6px_rgba(0,0,0,0.5)] transition-all duration-300 sm:translate-y-0 sm:border-dark-border sm:shadow-none sm:hover:-translate-y-1.5 sm:hover:border-royal/40 sm:hover:shadow-[0_15px_50px_rgba(111,45,189,0.4),0_6px_20px_rgba(111,45,189,0.25),0_2px_8px_rgba(0,0,0,0.5)]',
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
