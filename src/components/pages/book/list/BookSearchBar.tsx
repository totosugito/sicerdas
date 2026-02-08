import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, X, Filter } from 'lucide-react';  // Added X icon for clear button and Filter icon
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { BookFilter } from './BookFilter';

interface BookSearchBarProps {
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  onSearch?: (term: string) => void;
  isSearchDisabled?: boolean;
  filterData?: any;
  selectedFilters?: {
    categories: number[];
    groups: number[];
  };
  onFilterChange?: (filters: { categories: number[]; groups: number[] }) => void;
}

export const BookSearchBar = ({
  searchTerm,
  onSearchTermChange,
  onSearch,
  isSearchDisabled = false,
  filterData,
  selectedFilters = { categories: [], groups: [] },
  onFilterChange
}: BookSearchBarProps) => {
  const { t } = useTranslation();

  // Local state for input value to avoid updating parent on every keystroke
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm || '');

  // Sync local state with prop when it changes (e.g., from URL or clear search)
  useEffect(() => {
    setLocalSearchTerm(searchTerm || '');
  }, [searchTerm]);

  // State for mobile filter popover
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      // Update parent state only when searching
      onSearchTermChange?.(localSearchTerm);
      onSearch?.(localSearchTerm);
    }
  };

  const handleSearchClick = () => {
    // Update parent state only when searching
    onSearchTermChange?.(localSearchTerm);
    onSearch?.(localSearchTerm);
  };

  // Function to clear the search input
  const handleClearSearch = () => {
    onSearchTermChange?.('');
    setLocalSearchTerm('');
    onSearch?.('');
  };

  return (
    <div className={`p-2 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-2 transition-colors duration-200 ${localSearchTerm
        ? 'bg-primary/5 border-primary/20'
        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800'
      }`}>
      <div className="relative flex-1">
        <Search
          className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${localSearchTerm ? 'text-primary' : 'text-slate-400'
            }`}
        />
        <Input
          placeholder={t('home.searchPlaceholder')}
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`h-8 pl-10 pr-8 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400 ${localSearchTerm ? 'text-primary font-medium' : ''
            }`}
        />
        {/* Clear button - only show when there's text in the input */}
        {localSearchTerm && localSearchTerm.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-1/2 transform -translate-y-1/2 h-6 w-6 text-slate-400 hover:text-slate-600 hover:bg-transparent"
            onClick={handleClearSearch}
            type="button"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 border-t sm:border-t-0 sm:border-l border-slate-100 dark:border-slate-800 pt-2 sm:pt-0 pl-2">
        {(onFilterChange) && (
          <Popover open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 visible lg:hidden "
              >
                <Filter className="w-4 h-4 mr-2" />
                {t('home.filters')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] px-4">
              <BookFilter
                selectedFilters={selectedFilters}
                onFilterChange={(filters: { categories: number[]; groups: number[] }) => {
                  onFilterChange?.(filters);
                  setIsMobileFilterOpen(false);
                }}
                filterData={filterData}
                autoSubmit={false}
                idPrefix="search-bar"
              />
            </PopoverContent>
          </Popover>
        )}

        <Button variant={'outline'} size={'sm'} onClick={handleSearchClick} disabled={isSearchDisabled} className="flex-1">
          {t('home.search')}
        </Button>
      </div>
    </div>
  );
};