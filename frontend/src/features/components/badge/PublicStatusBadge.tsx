import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface PublicStatusBadgeProps {
  isPublic: boolean;
  className?: string;
}

export function PublicStatusBadge({ isPublic, className }: PublicStatusBadgeProps) {
  const { t } = useAppTranslation();

  return (
    <Badge
      variant="outline"
      className={cn(
        "capitalize font-medium border shadow-xs backdrop-blur-xs",
        isPublic
          ? "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/20"
          : "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
        className,
      )}
    >
      {isPublic
        ? t(($) => $.labels.visibility.public)
        : t(($) => $.labels.visibility.private)}
    </Badge>
  );
}
