import React from "react";
import { Badge } from "@/components/ui/badge";
import { EnumCourseStatus } from "backend/src/db/schema/course/enums.ts";
import { cn } from "@/lib/utils";

type CourseStatus = (typeof EnumCourseStatus)[keyof typeof EnumCourseStatus] | string;

export interface CourseStatusBadgeProps {
  status: CourseStatus;
  className?: string;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  [EnumCourseStatus.DRAFT]: {
    label: "Draft",
    className: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 border-amber-500/30",
  },
  [EnumCourseStatus.PUBLISHED]: {
    label: "Published",
    className: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/30",
  },
  [EnumCourseStatus.FINISHED]: {
    label: "Finished",
    className: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/30",
  },
  [EnumCourseStatus.ARCHIVED]: {
    label: "Archived",
    className: "bg-slate-500/10 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400 border-slate-500/30",
  },
  [EnumCourseStatus.DELETED]: {
    label: "Deleted",
    className: "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border-red-500/30",
  },
};

export function CourseStatusBadge({ status, className }: CourseStatusBadgeProps) {
  const config = statusConfig[status] || {
    label: status,
    className: "bg-secondary text-secondary-foreground border-transparent",
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
