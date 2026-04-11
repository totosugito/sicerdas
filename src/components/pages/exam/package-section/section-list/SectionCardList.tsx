import React from "react";
import { ExamPackageSection, ListSectionsResponse } from "@/api/exam-package-sections";
import { PaginationData } from "@/components/custom/table";
import { SectionCardListItem } from "./SectionCardListItem";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Layers } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface SectionCardListProps {
  data: ListSectionsResponse;
  isLoading: boolean;
  paginationData: PaginationData;
  onEdit: (section: ExamPackageSection) => void;
  onDelete: (section: ExamPackageSection) => void;
}

export function SectionCardList({
  data,
  isLoading,
  paginationData,
  onEdit,
  onDelete,
}: SectionCardListProps) {
  const { t } = useAppTranslation();
  const { openSideMenu } = useAuthStore();
  const items = data?.data?.items || [];

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-card rounded-2xl border border-dashed border-border/60 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
          <Layers className="h-10 w-10 text-primary opacity-40" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t(($) => $.exam.sections.table.noResult)}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          {t(($) => $.exam.sections.description)}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Grid of Cards */}
      <div className={cn(gridClass)}>
        {isLoading
          ? // Simple Skeleton
            Array.from({ length: paginationData?.limit || 8 }).map((_, i) => (
              <div
                key={i}
                className="h-[280px] rounded-2xl bg-muted/40 animate-pulse border border-border/20"
              />
            ))
          : items.map((section) => (
              <SectionCardListItem
                key={section.id}
                section={section}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
      </div>
    </div>
  );
}
