import { Book, getBookCover } from '@/components/pages/books/types/books';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Plus, Eye } from 'lucide-react';
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'

interface BookListNewProps {
  books: Book[];
  viewMode: 'grid' | 'list';
}

export const BookListNew = ({ books, viewMode}: BookListNewProps) => {
  const { t } = useTranslation()

  const gridClass = viewMode === 'grid'
    ? "grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6"
    : "grid grid-cols-1 gap-4";

  return (
    <div>
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