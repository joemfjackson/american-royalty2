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
            'transition-all duration-300 hover:border-royal/30 hover:shadow-[0_0_30px_rgba(111,45,189,0.12),0_0_60px_rgba(214,192,138,0.06)]',
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
