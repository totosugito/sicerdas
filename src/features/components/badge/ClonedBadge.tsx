import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface ClonedBadgeProps {
  className?: string;
  variant?: "solid" | "subtle";
}

export function ClonedBadge({ className, variant = "solid" }: ClonedBadgeProps) {
  const { t } = useAppTranslation();

  return (
    <Badge
      variant={variant === "subtle" ? "secondary" : "default"}
      className={cn(
        variant === "solid"
          ? "bg-sky-500 text-white hover:bg-sky-500/90 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30 shadow-sm border-transparent whitespace-nowrap"
          : "bg-sky-500/10 text-sky-600 border border-sky-500/20 dark:bg-sky-500/20 dark:text-sky-400 dark:border-sky-500/30 text-[10px] py-0.5 px-1.5 h-auto",
        className,
      )}
    >
      {t(($) => $.exam.packages.table.actions.clone)}
    </Badge>
  );
}
