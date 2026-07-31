import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({ icon: Icon, title, description, className, children }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 bg-card rounded-2xl border border-dashed border-border/60 text-center",
        className
      )}
    >
      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <Icon className="h-10 w-10 text-primary opacity-40" />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}
