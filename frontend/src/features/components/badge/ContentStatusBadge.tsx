import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

import { EnumContentStatus } from "@/api/types";

export type ContentStatus = (typeof EnumContentStatus)[keyof typeof EnumContentStatus] | string;

export interface ContentStatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const statusConfig: Record<string, string> = {
  [EnumContentStatus.DRAFT.toLowerCase()]: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  [EnumContentStatus.PUBLISHED.toLowerCase()]: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  [EnumContentStatus.UNPUBLISHED.toLowerCase()]: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/20",
  [EnumContentStatus.FINISHED.toLowerCase()]: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  [EnumContentStatus.ARCHIVED.toLowerCase()]: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
  [EnumContentStatus.DELETED.toLowerCase()]: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
};

export function ContentStatusBadge({ status, className }: ContentStatusBadgeProps) {
  const { t } = useAppTranslation();
  const normalizedStatus = status.toLowerCase();

  const statusClassName = statusConfig[normalizedStatus] || "bg-muted text-muted-foreground border-border";

  const getLabel = () => {
    switch (normalizedStatus) {
      case EnumContentStatus.DRAFT.toLowerCase():
        return t(($) => $.labels.statusValues.draft);
      case EnumContentStatus.PUBLISHED.toLowerCase():
        return t(($) => $.labels.statusValues.published);
      case EnumContentStatus.UNPUBLISHED.toLowerCase():
        return t(($) => $.labels.statusValues.unpublished);
      case EnumContentStatus.FINISHED.toLowerCase():
        return t(($) => $.labels.statusValues.finished);
      case EnumContentStatus.ARCHIVED.toLowerCase():
        return t(($) => $.labels.statusValues.archived);
      case EnumContentStatus.DELETED.toLowerCase():
        return t(($) => $.labels.statusValues.deleted);
      default:
        return status;
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium border shadow-xs backdrop-blur-xs", statusClassName, className)}
    >
      {getLabel()}
    </Badge>
  );
}
