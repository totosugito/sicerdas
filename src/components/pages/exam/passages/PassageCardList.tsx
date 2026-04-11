import React from "react";
import { ListPassagesResponse, ExamPassage } from "@/api/exam-passages";
import { PassageCardListItem } from "./PassageCardListItem";
import { PaginationData } from "@/components/custom/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppTranslation } from "@/lib/i18n-typed";
import { BookOpen } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface PassageCardListProps {
  data: ListPassagesResponse | undefined;
  isLoading: boolean;
  paginationData: PaginationData | undefined;
  onDelete: (passage: ExamPassage) => void;
}

export function PassageCardList({ data, isLoading, onDelete }: PassageCardListProps) {
  const { t } = useAppTranslation();
  const { openSideMenu } = useAuthStore();

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (isLoading) {
    return (
      <div className={cn(gridClass)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-4 border border-border/50 rounded-2xl p-4 bg-card/40"
          >
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <div className="pt-4 border-t border-border/40">
                <Skeleton className="h-3 w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = data?.data.items || [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-card/40 rounded-3xl border border-dashed border-border/60">
        <div className="h-16 w-16 bg-muted/50 rounded-2xl flex items-center justify-center mb-4">
          <BookOpen className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-bold text-foreground mb-1">
          {t(($) => $.exam.passages.table.noResult)}
        </h3>
        <p className="text-sm text-muted-foreground max-w-[250px] text-center">
          {t(($) => $.exam.passages.table.noData)}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(gridClass)}>
      {items.map((passage) => (
        <PassageCardListItem key={passage.id} passage={passage} onDelete={onDelete} />
      ))}
    </div>
  );
}
