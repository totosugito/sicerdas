import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger, PopoverPositioner } from "@/components/ui/popover";
import { Search, X, Filter } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useState, useEffect } from "react";
import { CourseFilter } from "./CourseFilter";

interface CourseSearchBarProps {
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  onSearch?: (term: string) => void;
  isSearchDisabled?: boolean;
  filterData?: any;
  selectedFilters?: {
    categories: string[];
    grades: number[];
  };
  onFilterChange?: (filters: { categories: string[]; grades: number[] }) => void;
}

export const CourseSearchBar = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  isSearchDisabled = false,
  filterData,
  selectedFilters = { categories: [], grades: [] },
  onFilterChange,
}: CourseSearchBarProps) => {
  const { t } = useAppTranslation();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || "");

  useEffect(() => {
    setLocalSearchTerm(searchTerm || "");
  }, [searchTerm]);

  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSearchTermChange?.(localSearchTerm);
      onSearch?.(localSearchTerm);
    }
  };

  const handleSearchClick = () => {
    onSearchTermChange?.(localSearchTerm);
    onSearch?.(localSearchTerm);
  };

  const handleClearSearch = () => {
    onSearchTermChange?.("");
    setLocalSearchTerm("");
    onSearch?.("");
  };

  return (
    <div
      className={`p-2 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-2 transition-colors duration-200 ${localSearchTerm
        ? "bg-primary/5 border-primary/20"
        : "bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
      }`}
    >
      <div className="relative flex-1">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${localSearchTerm ? "text-primary" : "text-slate-400"
            }`}
        />
        <Input
          placeholder={t(($) => $.course.public.searchPlaceholder)}
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`h-8 pl-10 pr-8 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 ${localSearchTerm ? "text-primary font-medium" : ""
            }`}
        />
        {localSearchTerm && localSearchTerm.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-transparent mr-2"
            onClick={handleClearSearch}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 pl-2">
        {onFilterChange && (
          <Popover open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <PopoverTrigger render={<Button variant="outline" size="sm" className="flex-1 visible lg:hidden " />}>
              <Filter className="w-4 h-4 mr-2" />
              {t(($) => $.labels.filter)}
            </PopoverTrigger>
            <PopoverPositioner>
              <PopoverContent className="w-[300px] p-5">
                <CourseFilter
                  selectedFilters={selectedFilters}
                  onFilterChange={(filters: { categories: string[]; grades: number[] }) => {
                    onFilterChange?.(filters);
                    setIsMobileFilterOpen(false);
                  }}
                  filterData={filterData}
                  autoSubmit={false}
                  idPrefix="search-bar"
                />
              </PopoverContent>
            </PopoverPositioner>
          </Popover>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={handleSearchClick}
          disabled={isSearchDisabled}
          className="flex-1"
        >
          {t(($) => $.labels.search)}
        </Button>
      </div>
    </div>
  );
};
