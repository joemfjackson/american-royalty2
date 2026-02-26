import { cn } from '@/lib/utils'

export interface StarRatingProps {
  /** Rating value from 0 to 5 */
  rating: number
  /** Maximum number of stars. Defaults to 5. */
  max?: number
  className?: string
}

function StarRating({ rating, max = 5, className }: StarRatingProps) {
  const clamped = Math.min(Math.max(0, Math.round(rating)), max)

  return (
    <span
      className={cn('inline-flex gap-0.5 text-gold', className)}
      role="img"
      aria-label={`${clamped} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, i) => (
        <span key={i} aria-hidden="true">
          {i < clamped ? '\u2605' : '\u2606'}
        </span>
      ))}
    </span>
  )
}

StarRating.displayName = 'StarRating'

export { StarRating }
export default StarRating
