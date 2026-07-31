import React from "react";
import { Badge } from "@/components/ui/badge";
import { getGradeColor } from "@/lib/app/exam-utils";
import { cn } from "@/lib/utils";

interface GradeBadgeProps {
  gradeName: string;
  className?: string;
}

export function GradeBadge({ gradeName, className }: GradeBadgeProps) {
  return (
    <Badge
      className={cn(
        getGradeColor(gradeName),
        "text-white border-none shadow-sm text-xs px-2 py-0.5 font-medium",
        className,
      )}
    >
      {gradeName}
    </Badge>
  );
}
