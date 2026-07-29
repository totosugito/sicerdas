import React from "react";
import { Search, X, LayoutGrid, ListIcon, Filter, ChevronRight, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectPositioner,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { EnumContentStatus } from "@/api/types";
import { useListCategorySimple } from "@/api/education/categories";
import { useListGradeSimple } from "@/api/education/grades";
import { CourseSortSelector } from "./CourseSortSelector";

interface CourseToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  status: string;
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
}

export function CourseToolbar({
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
}: CourseToolbarProps) {
  const { t } = useAppTranslation();

  const { data: categoryData } = useListCategorySimple({ limit: 100 });
  const { data: gradeData } = useListGradeSimple({ limit: 100 });

  const categories = categoryData?.data?.items ?? [];
  const grades = gradeData?.data?.items ?? [];

  const activeFilterCount = [categoryId, gradeId].filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
      <div className="flex flex-col lg:flex-row items-center gap-4">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t(($) => $.course.courses.table.search)}
            className="pl-10 h-10 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearchSubmit();
              }
            }}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              onClick={onClearSearch}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:ml-auto">
          {/* Status Filter */}
          <Select
            value={status || "all"}
            onValueChange={(val) => {
              const newStatus = !val || val === "all" ? undefined : val;
              onStatusChange(newStatus);
            }}
          >
            <SelectTrigger className="w-[160px] bg-card shadow-sm border-border/60 flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue
                placeholder={t(($) => $.course.courses.table.columns.status)}
                render={(_, { value }) => {
                  const label =
                    !value || value === "all"
                      ? t(($) => $.course.courses.table.statusFilter)
                      : t(
                        ($) =>
                          $.labels.statusValues[
                          value as keyof typeof $.labels.statusValues
                          ]
                      ) || value;
                  return <span className="text-left truncate block w-full">{label}</span>;
                }}
              />
            </SelectTrigger>
            <SelectPositioner>
              <SelectContent>
                <SelectItem value="all">
                  {t(($) => $.course.courses.table.statusFilter)}
                </SelectItem>
                {Object.values(EnumContentStatus).map((st) => (
                  <SelectItem key={st} value={st}>
                    {t(($) => $.labels.statusValues[st as keyof typeof $.labels.statusValues]) || st}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>

          {/* Sort Selector */}
          <CourseSortSelector
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
          />

          <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

          {/* View Mode Selector (Table / Card) */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
                viewMode === "table" ? "bg-background shadow-sm" : ""
              )}
              onClick={() => onViewModeChange("table")}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>{t(($) => $.course.courses.table.viewModes.table)}</span>
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
                viewMode === "card" ? "bg-background shadow-sm" : ""
              )}
              onClick={() => onViewModeChange("card")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{t(($) => $.course.courses.table.viewModes.card)}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Collapsible Advanced Filters */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full group">
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
            <Select
              value={categoryId || "all"}
              onValueChange={(val) => {
                const newCategoryId = !val || val === "all" ? undefined : val;
                onCategoryChange?.(newCategoryId);
              }}
            >
              <SelectTrigger className="w-[200px] bg-card shadow-sm border-border/60 flex items-center gap-2">
                <SelectValue
                  placeholder={t(($) => $.course.courses.table.categoryFilter ?? "All Categories")}
                  render={(_, { value }) => {
                    if (!value || value === "all") {
                      return <span className="text-left truncate block w-full">{t(($) => $.course.courses.table.categoryFilter ?? "All Categories")}</span>;
                    }
                    const matched = categories.find((c) => c.value === value);
                    return <span className="text-left truncate block w-full">{matched?.label || value}</span>;
                  }}
                />
              </SelectTrigger>
              <SelectPositioner>
                <SelectContent>
                  <SelectItem value="all">
                    {t(($) => $.course.courses.table.categoryFilter ?? "All Categories")}
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>

            {/* Grade Filter */}
            <Select
              value={gradeId || "all"}
              onValueChange={(val) => {
                const newGradeId = !val || val === "all" ? undefined : val;
                onGradeChange?.(newGradeId);
              }}
            >
              <SelectTrigger className="w-[200px] bg-card shadow-sm border-border/60 flex items-center gap-2">
                <SelectValue
                  placeholder={t(($) => $.course.courses.table.gradeFilter ?? "All Grades")}
                  render={(_, { value }) => {
                    if (!value || value === "all") {
                      return <span className="text-left truncate block w-full">{t(($) => $.course.courses.table.gradeFilter ?? "All Grades")}</span>;
                    }
                    const matched = grades.find((g) => g.value === value);
                    return <span className="text-left truncate block w-full">{matched?.label || value}</span>;
                  }}
                />
              </SelectTrigger>
              <SelectPositioner>
                <SelectContent>
                  <SelectItem value="all">
                    {t(($) => $.course.courses.table.gradeFilter ?? "All Grades")}
                  </SelectItem>
                  {grades.map((grade) => (
                    <SelectItem key={grade.value} value={grade.value}>
                      {grade.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectPositioner>
            </Select>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  onCategoryChange?.(undefined);
                  onGradeChange?.(undefined);
                }}
              >
                <X className="h-3.5 w-3.5 mr-1" />
                {t(($) => $.labels.clearAll)}
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
