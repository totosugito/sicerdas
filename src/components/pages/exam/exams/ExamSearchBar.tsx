import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ExamFilter } from "./ExamFilter";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";

interface ExamSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  onSearch: (term: string) => void;
  isSearchDisabled?: boolean;
  selectedFilters: {
    categoryKey: string;
    grades: number[];
  };
  onFilterChange: (filters: { categoryKey: string; grades: number[] }) => void;
}

export const ExamSearchBar = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  isSearchDisabled,
  selectedFilters,
  onFilterChange,
}: ExamSearchBarProps) => {
  const { t } = useAppTranslation();
  const [localSearch, setLocalSearch] = useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 500);

  useEffect(() => {
    setLocalSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    if (debouncedSearch !== searchTerm) {
      onSearch(debouncedSearch);
    }
  }, [debouncedSearch]);

  const handleClear = () => {
    setLocalSearch("");
    onSearch("");
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1 group">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
          <Search className="w-4.5 h-4.5" />
        </div>
        <Input
          placeholder={t(($) => $.exam.table.search)}
          value={localSearch}
          onChange={(e) => {
            setLocalSearch(e.target.value);
            onSearchTermChange(e.target.value);
          }}
          disabled={isSearchDisabled}
          className="pl-11 pr-10 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
        {localSearch && (
          <button
            onClick={handleClear}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 shrink-0"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-[300px] sm:w-[400px] border-l-slate-200 dark:border-l-slate-800"
        >
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold">{t(($) => $.general.filter)}</SheetTitle>
          </SheetHeader>
          <div className="px-1">
            <ExamFilter
              selectedFilters={selectedFilters}
              onFilterChange={onFilterChange}
              idPrefix="mobile-filter"
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
