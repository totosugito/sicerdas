import { useTranslation } from 'react-i18next'
import { Search, LayoutGrid, List as ListIcon, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface BooksHeroSectionProps {
  searchTerm: string
  onSearchTermChange: (value: string) => void
  onSearch: () => void
  isSearchDisabled?: boolean
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onOpenFilter?: () => void
}

export function BooksHeroSection({
  searchTerm,
  onSearchTermChange,
  onSearch,
  isSearchDisabled = false,
  viewMode,
  onViewModeChange,
  onOpenFilter
}: BooksHeroSectionProps) {
  const { t } = useTranslation()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch()
    }
  }

  return (
    <div className="mb-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('home.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('home.subtitle')}
          </p>
        </div>

        {/* View Toggles */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => onViewModeChange('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => onViewModeChange('list')}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mt-6 bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder={t('home.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className="pl-10 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-2 md:pt-0 pl-2">
          {onOpenFilter && (
            <Button
              variant="outline"
              onClick={onOpenFilter}
              className="lg:hidden shrink-0"
            >
              <Filter className="w-4 h-4 mr-2" />
              {t('home.filters')}
            </Button>
          )}

          <Button onClick={onSearch} disabled={isSearchDisabled} className="shrink-0 w-full md:w-auto">
            {t('home.search')}
          </Button>
        </div>
      </div>
    </div>
  )
}