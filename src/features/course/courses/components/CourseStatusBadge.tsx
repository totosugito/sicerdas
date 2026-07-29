import React from "react";
import { Badge } from "@/components/ui/badge";
import { EnumContentStatus } from "backend/src/db/schema/enum/enum-app.ts";
import { cn } from "@/lib/utils";

type CourseStatus = (typeof EnumContentStatus)[keyof typeof EnumContentStatus] | string;

export interface CourseStatusBadgeProps {
  status: CourseStatus;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  [EnumContentStatus.DRAFT]: {
    label: "Draft",
    className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  [EnumContentStatus.PUBLISHED]: {
    label: "Published",
    className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  [EnumContentStatus.FINISHED]: {
    label: "Finished",
    className: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  [EnumContentStatus.ARCHIVED]: {
    label: "Archived",
    className: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
  },
  [EnumContentStatus.DELETED]: {
    label: "Deleted",
    className: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20",
  },
};

export function CourseStatusBadge({ status, className }: CourseStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-muted text-muted-foreground border-border",
  };

  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium border shadow-xs backdrop-blur-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
