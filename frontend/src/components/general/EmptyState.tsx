import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type EmptyStateColor = "primary" | "amber" | "blue" | "rose" | "emerald" | "violet";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
  children?: React.ReactNode;
  variant?: "default" | "glow";
  color?: EmptyStateColor;
}

const colorVariants = {
  primary: {
    glow: "bg-primary/20",
    bg: "from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10",
    border: "border-primary/20 dark:border-primary/30",
    shadow: "shadow-primary/10",
    icon: "text-primary"
  },
  amber: {
    glow: "bg-amber-500/20",
    bg: "from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20",
    border: "border-amber-200/50 dark:border-amber-700/30",
    shadow: "shadow-amber-500/10",
    icon: "text-amber-600 dark:text-amber-400"
  },
  blue: {
    glow: "bg-blue-500/20",
    bg: "from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20",
    border: "border-blue-200/50 dark:border-blue-700/30",
    shadow: "shadow-blue-500/10",
    icon: "text-blue-600 dark:text-blue-400"
  },
  rose: {
    glow: "bg-rose-500/20",
    bg: "from-rose-100 to-rose-50 dark:from-rose-900/40 dark:to-rose-900/20",
    border: "border-rose-200/50 dark:border-rose-700/30",
    shadow: "shadow-rose-500/10",
    icon: "text-rose-600 dark:text-rose-400"
  },
  emerald: {
    glow: "bg-emerald-500/20",
    bg: "from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-900/20",
    border: "border-emerald-200/50 dark:border-emerald-700/30",
    shadow: "shadow-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-400"
  },
  violet: {
    glow: "bg-violet-500/20",
    bg: "from-violet-100 to-violet-50 dark:from-violet-900/40 dark:to-violet-900/20",
    border: "border-violet-200/50 dark:border-violet-700/30",
    shadow: "shadow-violet-500/10",
    icon: "text-violet-600 dark:text-violet-400"
  }
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
  children,
  variant = "default",
  color = "primary"
}: EmptyStateProps) {
  const colors = colorVariants[color];

  if (variant === "glow") {
    return (
      <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center", className)}>
        <div className="relative mb-6">
          <div className={cn("absolute inset-0 blur-3xl rounded-full", colors.glow)} />
          <div className={cn(
            "relative w-20 h-20 bg-gradient-to-br rounded-3xl flex items-center justify-center border shadow-xl",
            colors.bg,
            colors.border,
            colors.shadow
          )}>
            <Icon className={cn("w-10 h-10", colors.icon)} />
          </div>
        </div>
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] mt-2 font-medium leading-relaxed">
          {description}
        </p>
        {children && <div className="mt-6">{children}</div>}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-20 px-6 bg-card rounded-2xl border border-dashed border-border/60 text-center",
        className
      )}
    >
      <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
        <Icon className={cn("h-10 w-10 opacity-40", colors.icon)} />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
        {description}
      </p>
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

