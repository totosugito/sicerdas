import React from "react";
import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface LectureStatusBadgeProps {
  isEnrolled?: boolean;
  isCompleted?: boolean;
  className?: string;
}

export function LectureStatusBadge({ isEnrolled, isCompleted, className }: LectureStatusBadgeProps) {
  const { t } = useAppTranslation();

  if (isEnrolled) {
    if (!isCompleted) return null;
    return (
      <Badge className={cn("bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none text-[10px] font-bold gap-1", className)}>
        <CheckCircle2 className="h-3 w-3" />
        {t(($) => $.course.public.player.completed)}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("text-[10px] font-medium text-slate-400", className)}>
      {t(($) => $.course.public.detail.locked)}
    </Badge>
  );
}
