import { useAppTranslation } from "@/lib/i18n-typed";
import { SectionSortSelector } from "./SectionSortSelector";
import { ViewModeToggle, SearchInput } from "@/features/components";

interface SectionToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  viewMode: "table" | "card";
  onViewModeChange: (viewMode: "table" | "card") => void;
}

export function SectionToolbar({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  onClearSearch,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SectionToolbarProps) {
  const { t } = useAppTranslation();

  return (
    <div className="flex flex-col lg:flex-row items-center gap-4 bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
      <SearchInput
        value={searchTerm}
        onChange={onSearchTermChange}
        onSubmit={onSearchSubmit}
        onClear={onClearSearch}
        placeholder={t(($) => $.exam.sections.table.search)}
      />

      <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:ml-auto">
        <SectionSortSelector
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSortChange={onSortChange}
        />

        <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

        <ViewModeToggle
          viewMode={viewMode}
          onViewModeChange={onViewModeChange}
          tableLabel={t(($) => $.exam.packages.table.viewModes.table)}
          cardLabel={t(($) => $.exam.packages.table.viewModes.card)}
        />
      </div>
    </div>
  );
}
