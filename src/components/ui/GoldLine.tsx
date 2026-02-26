import { cn } from '@/lib/utils'

export interface GoldLineProps {
  /** Width of the line (CSS value). Defaults to "60px". */
  width?: string
  className?: string
}

function GoldLine({ width = '60px', className }: GoldLineProps) {
  return (
    <div
      className={cn('gold-line', className)}
      style={{ width }}
      aria-hidden="true"
    />
  )
}

GoldLine.displayName = 'GoldLine'

export { GoldLine }
export default GoldLine
