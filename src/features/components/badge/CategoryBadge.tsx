import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  categoryName: string;
  className?: string;
}

export function CategoryBadge({ categoryName, className }: CategoryBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn("bg-primary/5 text-primary", className)}
    >
      {categoryName}
    </Badge>
  );
}
