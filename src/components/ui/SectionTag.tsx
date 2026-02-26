import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface SectionTagProps extends HTMLAttributes<HTMLSpanElement> {}

function SectionTag({ className, ...props }: SectionTagProps) {
  return (
    <span
      className={cn('section-tag', className)}
      {...props}
    />
  )
}

SectionTag.displayName = 'SectionTag'

export { SectionTag }
export default SectionTag
