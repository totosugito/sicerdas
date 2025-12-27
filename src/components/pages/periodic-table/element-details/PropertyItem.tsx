import { cn } from '@/lib/utils'

interface PropertyItemProps {
  label: string
  value?: string | number
  unit?: string
  className?: string
  isHtml?: boolean
}

export function PropertyItem({ label, value, unit, className, isHtml = false }: PropertyItemProps) {
  const hasValue = value !== null && value !== '' && value !== 'N/A' && value !== 'None';

  if(value === 'None')
    value = ''

  return (
    <div className={cn('text-sm', className)}>
      <span className={cn(" ", hasValue ? "text-foreground" : "text-muted-foreground/80")}>{label} :</span>
      {isHtml ?
        <span
          className={cn("font-mono", hasValue ? "text-primary" : "text-muted-foreground/80")}
          dangerouslySetInnerHTML={{ __html: " " + value || ' ' }}
        /> :
        <span className={cn("font-mono", hasValue ? "text-primary" : "text-muted-foreground/80")}> {value}</span>}
      <span className={"font-mono text-muted-foreground/80"}> {unit}</span>
    </div>
  )
}