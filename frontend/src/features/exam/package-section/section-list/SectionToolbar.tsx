import { useAppTranslation } from "@/lib/i18n-typed";
import { SectionSortSelector } from "./SectionSortSelector";
import { ViewModeToggle, SearchInput, ExamTypeSelect } from "@/features/components";
import { Card, CardContent } from "@/components/ui/card";

interface SectionToolbarProps {
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
  disabled?: boolean;
}

export function SectionToolbar({
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
  disabled,
}: SectionToolbarProps) {
  const { t } = useAppTranslation();

  return (
    <Card>
      <CardContent className="flex flex-row flex-wrap items-center justify-between gap-4 p-4 w-full">
        <div className="flex-1 min-w-[280px] max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={onSearchTermChange}
            onSubmit={onSearchSubmit}
            onClear={onClearSearch}
            placeholder={t(($) => $.exam.sections.table.search)}
            disabled={disabled}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ExamTypeSelect value={examTypes} onValueChange={onExamTypesChange} disabled={disabled} />

          <SectionSortSelector
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSortChange={onSortChange}
            disabled={disabled}
          />

          <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

          <ViewModeToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
            tableLabel={t(($) => $.exam.packages.table.viewModes.table)}
            cardLabel={t(($) => $.exam.packages.table.viewModes.card)}
            disabled={disabled}
          />
        </div>
      </CardContent>
    </Card>
  );
}
