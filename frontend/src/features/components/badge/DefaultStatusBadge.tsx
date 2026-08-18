import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface DefaultStatusBadgeProps {
  isDefault: boolean;
  className?: string;
}

export function DefaultStatusBadge({ isDefault, className }: DefaultStatusBadgeProps) {
  const { t } = useAppTranslation();

  return (
    <Badge
      className={cn(
        "shadow-sm border-transparent",
        isDefault
          ? "bg-indigo-600 text-white hover:bg-indigo-600/90 dark:bg-indigo-600/20 dark:text-indigo-400 dark:border-indigo-500/30"
          : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
        className,
      )}
    >
      {isDefault
        ? t(($) => $.labels.yesNo.yes)
        : t(($) => $.labels.yesNo.no)}
    </Badge>
  );
}
