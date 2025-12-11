import { cn } from '@/lib/utils'

// Define the dictionary entry type
interface ChemistryTerm {
  id: number
  w: string
  tr: string
}

interface ChemistryCardProps {
  term: ChemistryTerm
  index: number
}

export function ChemistryCard({ term, index }: ChemistryCardProps) {
  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-xl border border-border bg-card p-6",
        "shadow-[var(--card-shadow)] transition-all duration-300 ease-out",
        "hover:shadow-[var(--card-shadow-hover)] hover:-translate-y-1",
        "animate-in fade-in slide-in-from-bottom-4"
      )}
      style={{ 
        animationDelay: `${Math.min(index * 50, 300)}ms`, 
        animationFillMode: 'backwards' 
      } as React.CSSProperties}
    >
      {/* Decorative element */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-primary/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      
      <h3 className="mb-3 text-lg font-semibold text-foreground tracking-tight">
        {term.w}
      </h3>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {term.tr}
      </p>
      
      {/* ID badge */}
      {/* <div className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-medium text-accent-foreground">
        {term.dictId}
      </div> */}
    </article>
  )
}