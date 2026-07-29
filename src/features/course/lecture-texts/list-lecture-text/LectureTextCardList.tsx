import React from "react";
import { LectureTextItem } from "@/api/course/lecture-texts";
import { LectureTextCard } from "./LectureTextCard";
import { useAppTranslation } from "@/lib/i18n-typed";
import { FileText } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";

interface LectureTextCardListProps {
  items: LectureTextItem[];
  isLoading?: boolean;
  limit?: number;
  onPreview: (article: LectureTextItem) => void;
  onDelete: (article: LectureTextItem) => void;
}

export function LectureTextCardList({
  items,
  isLoading,
  limit = 6,
  onPreview,
  onDelete,
}: LectureTextCardListProps) {
  const { t } = useAppTranslation();
  const { openSideMenu } = useAuthStore();

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (!isLoading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 bg-card rounded-2xl border border-dashed border-border/60 text-center">
        <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-6">
          <FileText className="h-10 w-10 text-primary opacity-40" />
        </div>
        <h3 className="text-xl font-bold text-foreground mb-2">
          {t(($) => $.course.lectureTexts.table.noData)}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed">
          {t(($) => $.course.lectureTexts.description)}
        </p>
      </div>
    );
  }

  return (
    <div className={cn(gridClass)}>
      {isLoading
        ? Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="h-44 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
            />
          ))
        : items.map((item) => (
            <LectureTextCard
              key={item.id}
              article={item}
              onPreview={onPreview}
              onDelete={onDelete}
            />
          ))}
    </div>
  );
}
