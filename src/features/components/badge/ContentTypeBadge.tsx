import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { EnumContentType } from "@/api/types";

export type ContentType = (typeof EnumContentType)[keyof typeof EnumContentType] | string;

export interface ContentTypeBadgeProps {
  type: ContentType;
  className?: string;
}

const typeConfig: Record<string, string> = {
  [EnumContentType.BOOK.toLowerCase()]: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  [EnumContentType.EXAM.toLowerCase()]: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
  [EnumContentType.TEST.toLowerCase()]: "bg-pink-500/15 text-pink-700 dark:text-pink-400 border-pink-500/20",
  [EnumContentType.COURSE.toLowerCase()]: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
  [EnumContentType.OTHER.toLowerCase()]: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/20",
};

export function ContentTypeBadge({ type, className }: ContentTypeBadgeProps) {
  const { t } = useAppTranslation();
  const normalizedType = type.toLowerCase();

  const typeClassName = typeConfig[normalizedType] || "bg-muted text-muted-foreground border-border";

  const getLabel = () => {
    switch (normalizedType) {
      case EnumContentType.BOOK.toLowerCase():
        return t(($) => $.version.form.dataType.options.book);
      case EnumContentType.EXAM.toLowerCase():
        return t(($) => $.version.form.dataType.options.exam);
      case EnumContentType.TEST.toLowerCase():
        return t(($) => $.version.form.dataType.options.test);
      case EnumContentType.COURSE.toLowerCase():
        return t(($) => $.version.form.dataType.options.course);
      case EnumContentType.OTHER.toLowerCase():
        return t(($) => $.version.form.dataType.options.other);
      default:
        return type;
    }
  };

  return (
    <Badge
      variant="outline"
      className={cn("capitalize font-medium border shadow-xs backdrop-blur-xs", typeClassName, className)}
    >
      {getLabel()}
    </Badge>
  );
}
