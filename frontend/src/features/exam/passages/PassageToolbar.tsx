import { useAppTranslation } from "@/lib/i18n-typed";
import { PassageSortSelector } from "./PassageSortSelector";
import { ViewModeToggle, SearchInput } from "@/features/components";
import { Card, CardContent } from "@/components/ui/card";

interface PassageToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  onSearchSubmit: () => void;
  onClearSearch: () => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (sortBy: string, sortOrder: "asc" | "desc") => void;
  viewMode: "table" | "card";
  onViewModeChange: (viewMode: "table" | "card") => void;
  disabled?: boolean;
}

export function PassageToolbar({
  searchTerm,
  onSearchTermChange,
  onSearchSubmit,
  onClearSearch,
  sortBy,
  sortOrder,
  onSortChange,
  viewMode,
  onViewModeChange,
  disabled,
}: PassageToolbarProps) {
  const { t } = useAppTranslation();

  return (
    <Card>
      <CardContent className="flex flex-row flex-wrap items-center justify-between gap-4 p-4 w-full">
        <div className="flex-1 min-w-[280px] max-w-md w-full">
          <SearchInput
            value={searchTerm}
            onChange={onSearchTermChange}
            onSubmit={onSearchSubmit}
            onClear={onClearSearch}
            placeholder={t(($) => $.exam.passages.table.search)}
            disabled={disabled}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <PassageSortSelector
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
