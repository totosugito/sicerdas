import { getGrade, getGradeColor } from '@/components/pages/book/types/books';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { BookListItem } from '@/api/book';
import { useAuthStore } from '@/stores/useAuthStore';

import { useNavigate, Link } from '@tanstack/react-router';
import { AppRoute } from '@/constants/app-route';

interface BookCardProps {
  books: BookListItem[];
  viewMode: 'grid' | 'list';
}

export const BookCard = ({ books, viewMode }: BookCardProps) => {
  const { t } = useTranslation()

  const { openSideMenu } = useAuthStore()

  const gridClass = viewMode === 'grid'
    ? openSideMenu
      ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"
    : "grid grid-cols-1 gap-4";

  return (
    <div>
      {/* Book List */}
      <div className={gridClass}>
        {books.map((book) => (
          <BookCardView key={book.id} book={book} viewMode={viewMode} />
        ))}
      </div>
    </div>
  );
};

interface BookCardViewProps {
  book: BookListItem;
  viewMode: 'grid' | 'list';
}

const BookCardView = ({ book, viewMode }: BookCardViewProps) => {
  const isListView = viewMode === 'list';

  const navigate = useNavigate()

  const slug = book.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');

  const handleBookClick = () => {
    navigate({
      to: AppRoute.book.detail.url,
      params: { id: `${book.bookId}-${slug}` }
    })
  }

  return (
    <div className={cn(
      "group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden",
      isListView ? "flex flex-row h-auto min-h-[160px]" : "flex flex-col h-full"
    )}>
      {/* Image Container */}
      <div
        onClick={handleBookClick}
        className={cn(
          "relative overflow-hidden bg-slate-100 dark:bg-slate-700 cursor-pointer",
          isListView ? "w-32 sm:w-48 shrink-0" : "aspect-[2/3] w-full max-h-[280px]"
        )}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url("${book.cover.xs}")`,
          }}
        />
        <div className="absolute top-3 left-3">
          <Badge className={cn(getGradeColor(book.grade.name), "text-white rounded shadow-sm backdrop-blur-sm text-xs px-2 py-1 border-muted", isListView ? "" : "")}>
            {book.grade.name}{getGrade(book.grade.grade, ' - ')}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className={cn(
            "font-bold text-slate-900 dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors",
            isListView ? "text-lg line-clamp-2" : "text-base line-clamp-2"
          )}>
          <Link
            to={AppRoute.book.detail.url}
            params={{ id: `${book.bookId}-${slug}` }}
            className="cursor-pointer"
          >
            {book.title}
          </Link>
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-3 line-clamp-1">
          {book.author || 'Unknown Author'}
        </p>

        {/* Extra Description for List View */}
        {/* {isListView && (
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-3 hidden sm:block">
            {book.description || 'No description available for this book.'}
          </p>
        )} */}

        <div className="mt-auto pt-3 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            {book.group.shortName || book.group.name}
          </span>
          <span className="text-xs font-medium text-slate-400">
            {book.publishedYear}
          </span>
        </div>
      </div>
    </div>
  );
};