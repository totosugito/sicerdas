import React from "react";
import { Search, X, LayoutGrid, ListIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { cn } from "@/lib/utils";
import { PackageSortSelector } from "./PackageSortSelector";
import { MultiSelect } from "@/components/ui/multi-select";
import { EnumExamType } from "@/api/exam/types";

interface PackageToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  examTypes: string[];
  onExamTypesChange: (examTypes: string[]) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  viewMode: "table" | "card";
  onViewModeChange: (viewMode: "table" | "card") => void;
}

export function PackageToolbar({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  onClearSearch,
  examTypes,
  onExamTypesChange,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
}: PackageToolbarProps) {
  const { t } = useAppTranslation();

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
      <div className="relative w-full lg:max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t(($) => $.exam.packages.table.search)}
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
        <MultiSelect
          options={[
            {
              label: t(($) => $.exam.packages.form.examType.options.official),
              value: EnumExamType.OFFICIAL,
            },
            {
              label: t(($) => $.exam.packages.form.examType.options.custom_practice),
              value: EnumExamType.CUSTOM_PRACTICE,
            },
            {
              label: t(($) => $.exam.packages.form.examType.options.course_exam),
              value: EnumExamType.COURSE_EXAM,
            },
          ]}
          value={examTypes}
          onValueChange={onExamTypesChange}
          placeholder={t(($) => $.exam.packages.form.examType.label)}
          className="w-full sm:w-[180px] bg-background/50 border-border/60 rounded-xl"
          showAsSimple
        />

        <PackageSortSelector
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />

        <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

        <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
              viewMode === "table" ? "bg-background shadow-sm" : "",
            )}
            onClick={() => onViewModeChange("table")}
          >
            <ListIcon className="h-3.5 w-3.5" />
            <span>{t(($) => $.exam.packages.table.viewModes.table)}</span>
          </Button>
          <Button
            variant={viewMode === "card" ? "secondary" : "ghost"}
            size="sm"
            className={cn(
              "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
              viewMode === "card" ? "bg-background shadow-sm" : "",
            )}
            onClick={() => onViewModeChange("card")}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            <span>{t(($) => $.exam.packages.table.viewModes.card)}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

