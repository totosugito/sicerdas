import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface ActiveStatusBadgeProps {
  isActive: boolean;
  className?: string;
}

export function ActiveStatusBadge({ isActive, className }: ActiveStatusBadgeProps) {
  const { t } = useAppTranslation();

  return (
    <Badge
      className={cn(
        "shadow-sm border-transparent",
        isActive
          ? "bg-emerald-600 text-white hover:bg-emerald-600/90 dark:bg-emerald-600/20 dark:text-emerald-400 dark:border-emerald-500/30"
          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        className,
      )}
    >
      {isActive ? t(($) => $.labels.active) : t(($) => $.labels.inactive)}
    </Badge>
  );
}
