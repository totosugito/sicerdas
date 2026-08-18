import React from "react";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";

interface NewBadgeProps {
  className?: string;
  variant?: "solid" | "subtle";
}

export function NewBadge({ className, variant = "solid" }: NewBadgeProps) {
  const { t } = useAppTranslation();

  return (
    <Badge
      variant={variant === "subtle" ? "secondary" : "default"}
      className={cn(
        variant === "solid"
          ? "bg-amber-500 text-white hover:bg-amber-500/90 shadow-sm border-transparent animate-pulse whitespace-nowrap"
          : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
        className,
      )}
    >
      {t(($) => $.labels.new)}
    </Badge>
  );
}
