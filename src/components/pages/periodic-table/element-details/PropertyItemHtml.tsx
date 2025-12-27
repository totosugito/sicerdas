import { cn } from '@/lib/utils';

interface PropertyItemHtmlProps {
  label: string;
  value?: string;
  className?: string;
}

export function PropertyItemHtml({ label, value, className }: PropertyItemHtmlProps) {
  const hasValue = value !== null && value !== '' && value !== 'N/A';

  return (
    <div className={cn('text-sm', className)}>
      <div className={cn("mb-1 font-bold", hasValue ? "text-muted-foreground" : "text-muted-foreground/80")}>
        {label}
      </div>
      {hasValue && (
        <div 
          className="prose prose-sm max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: value || '' }} 
        />
      )}
    </div>
  );
}