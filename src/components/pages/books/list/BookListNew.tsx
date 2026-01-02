import { Book, getBookCover } from '@/components/pages/books/types/books';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Eye, Search, LayoutGrid, List as ListIcon, Filter } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/input'

interface BookListNewProps {
  books: Book[];
  viewMode: 'grid' | 'list';
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  onSearch?: () => void;
  isSearchDisabled?: boolean;
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onOpenFilter?: () => void;
  totalBooks?: number;
}

export const BookListNew = ({ books, viewMode, searchTerm, onSearchTermChange, onSearch, isSearchDisabled = false, onViewModeChange, onOpenFilter, totalBooks }: BookListNewProps) => {
  const { t } = useTranslation()

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.()
    }
  }

  const gridClass = viewMode === 'grid'
    ? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
    : "grid grid-cols-1 gap-4";

  return (
    <div>
      {/* Search Bar */}
      <div className="mt-6 bg-white dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder={t('home.searchPlaceholder')}
            value={searchTerm || ''}
            onChange={(e) => onSearchTermChange?.(e.target.value)}
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

      {/* View Toggles and Results Count */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => onViewModeChange?.('grid')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            className="h-8 px-2"
            onClick={() => onViewModeChange?.('list')}
          >
            <ListIcon className="w-4 h-4" />
          </Button>
        </div>
        
        {totalBooks !== undefined && (
          <p className="text-slate-500 dark:text-slate-400">
            Showing <span className="font-bold text-slate-900 dark:text-white">{books.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{totalBooks}</span> books
          </p>
        )}
      </div>

      {/* Book List */}
      <div className={gridClass}>
        {books.map((book) => (
          <BookCardNew key={book.id} book={book} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
};

interface BookCardNewProps {
  book: Book;
  viewMode: 'grid' | 'list';
}

const BookCardNew = ({ book, viewMode }: BookCardNewProps) => {
  const isListView = viewMode === 'list';

  const getGradeLabel = (gradeName: string) => {
    if (gradeName.includes('SD')) return 'SD';
    if (gradeName.includes('SMP')) return 'SMP';
    if (gradeName.includes('SMA') || gradeName.includes('MA')) return 'SMA';
    if (gradeName.includes('SMK')) return 'SMK';
    if (gradeName.includes('Umum')) return 'UMUM';
    return 'SD';
  };

  const getGradeColor = (gradeName: string) => {
    if (gradeName.includes('SD')) return 'bg-emerald-500/90';
    if (gradeName.includes('SMP')) return 'bg-purple-500/90';
    if (gradeName.includes('SMA') || gradeName.includes('MA')) return 'bg-primary/90';
    if (gradeName.includes('SMK')) return 'bg-orange-500/90';
    if (gradeName.includes('Umum')) return 'bg-orange-500/90';
    return 'bg-emerald-500/90';
  };

  return (
    <div className={cn(
      "group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden",
      isListView ? "flex flex-row h-auto min-h-[160px]" : "flex flex-col h-full"
    )}>
      {/* Image Container */}
      <div className={cn(
        "relative overflow-hidden bg-slate-100 dark:bg-slate-700",
        isListView ? "w-32 sm:w-48 shrink-0" : "aspect-[2/3] w-full"
      )}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url("${getBookCover(book.bookId, "md") || 'https://placehold.co/300x400/e2e8f0/64748b?text=Cover'}")`,
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${getGradeColor(book.grade.name)} text-white rounded shadow-sm backdrop-blur-sm text-xs px-2.5 py-1 font-semibold`}>
            {getGradeLabel(book.grade.name)}
          </Badge>
        </div>

        {/* Hover Actions - Only show on grid view or large list view to prevent clutter */}
        {(!isListView || true) && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
            <Button
              size="icon"
              variant="secondary"
              className="size-8 sm:size-10 rounded-full bg-white text-slate-900 hover:text-primary hover:scale-110 transition-all shadow-lg"
              title="Add to Library"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="size-8 sm:size-10 rounded-full bg-white text-slate-900 hover:text-primary hover:scale-110 transition-all shadow-lg"
              title="Quick View"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3 className={cn(
          "font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors",
          isListView ? "text-lg line-clamp-2" : "text-base line-clamp-2"
        )}>
          {book.title}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
          {book.author || 'Unknown Author'}
        </p>

        {/* Extra Description for List View */}
        {isListView && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 hidden sm:block">
            {book.description || 'No description available for this book.'}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-1 text-yellow-500 text-xs">
            <Star className="w-4 h-4 fill-current" />
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {book.rating || '4.5'}
            </span>
          </div>
          <span className="text-xs font-medium text-slate-400">
            {book.publishedYear}
          </span>
        </div>
      </div>
    </div>
  );
};