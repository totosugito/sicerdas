import { cn } from '@/lib/utils';

interface PropertyItemProps {
  label: string;
  value?: string;
  isHtml?: boolean;
}

export const PropertyItem = ({
  label,
  value,
  isHtml = false
}: PropertyItemProps) => {
  if (!value) return null;

  return (
    <div className="bg-muted/30 rounded-md px-2 py-1.5">
      <div className="text-muted-foreground text-[10px] uppercase tracking-wide">{label}</div>
      {isHtml ? (
        <div
          className="text-foreground font-mono truncate"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div className="text-foreground font-mono truncate">{value}</div>
      )}
    </div>
  );
};