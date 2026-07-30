import React from "react";
import { X, ChevronRight, SlidersHorizontal, Folder, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { useListCategorySimple } from "@/api/education/categories";
import { useListGradeSimple } from "@/api/education/grades";
import { LectureTextSortSelector } from "./LectureTextSortSelector";
import { SearchInput, ContentStatusSelect, ViewModeToggle, FilterSelect } from "@/features/components";

interface LectureTextToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  status?: string;
  onStatusChange: (status: string | undefined) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  viewMode: "table" | "card";
  onViewModeChange: (viewMode: "table" | "card") => void;
  categoryId?: string;
  gradeId?: string;
  onCategoryChange?: (categoryId: string | undefined) => void;
  onGradeChange?: (gradeId: string | undefined) => void;
  onClearFilters?: () => void;
  disabled?: boolean;
}

export function LectureTextToolbar({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  onClearSearch,
  status,
  onStatusChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  categoryId,
  gradeId,
  onCategoryChange,
  onGradeChange,
  onClearFilters,
  disabled,
}: LectureTextToolbarProps) {
  const { t } = useAppTranslation();

  const { data: categoryData } = useListCategorySimple({ limit: 100 });
  const { data: gradeData } = useListGradeSimple({ limit: 100 });

  const categories = categoryData?.data?.items ?? [];
  const grades = gradeData?.data?.items ?? [];

  const activeFilterCount = [categoryId, gradeId].filter(Boolean).length;

  return (
    <Card>
      <CardContent className="p-4 w-full gap-2">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4 p-4 w-full">
          <div className="flex-1 min-w-[280px] max-w-md">
            <SearchInput
              value={searchTerm}
              onChange={onSearchTermChange}
              onSubmit={onSearchSubmit}
              onClear={onClearSearch}
              placeholder={t(($) => $.course.lectureTexts.table.search)}
              disabled={disabled}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:ml-auto">
            {/* Status Filter */}
            <ContentStatusSelect value={status} onValueChange={onStatusChange} disabled={disabled} />

            {/* Sort Selector */}
            <LectureTextSortSelector
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={onSortChange}
              disabled={disabled}
            />

            <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

            <ViewModeToggle
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
              tableLabel={t(($) => $.course.lectureTexts.table.viewModes.table)}
              cardLabel={t(($) => $.course.lectureTexts.table.viewModes.card)}
              disabled={disabled}
            />
          </div>
        </div>
        {/* Collapsible Advanced Filters */}
        <Collapsible disabled={disabled}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full group disabled:opacity-50 disabled:cursor-not-allowed">
            <ChevronRight className="h-4 w-4 transition-transform [[data-panel-open]_&]:rotate-90" />
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>{t(($) => $.labels.moreFilters)}</span>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {activeFilterCount}
              </Badge>
            )}
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <FilterSelect
                value={categoryId}
                onValueChange={onCategoryChange ?? (() => { })}
                options={categories}
                placeholder={t(($) => $.course.courses.table.categoryFilter)}
                icon={Folder}
                disabled={disabled}
              />

              {/* Grade Filter */}
              <FilterSelect
                value={gradeId}
                onValueChange={onGradeChange ?? (() => { })}
                options={grades}
                placeholder={t(($) => $.course.courses.table.gradeFilter)}
                icon={GraduationCap}
                disabled={disabled}
              />

              {activeFilterCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    if (onClearFilters) {
                      onClearFilters();
                    } else {
                      onCategoryChange?.(undefined);
                      onGradeChange?.(undefined);
                    }
                  }}
                  disabled={disabled}
                >
                  <X className="h-3.5 w-3.5 mr-1" />
                  {t(($) => $.labels.clearAll)}
                </Button>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
