import { getBookCover } from '@/components/pages/books/types/books';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'
import { useTranslation } from 'react-i18next'
import { BookListItem } from '@/api/book/book';

interface BookCardProps {
  books: BookListItem[];
  viewMode: 'grid' | 'list';
}

export const BookCard = ({ books, viewMode }: BookCardProps) => {
  const { t } = useTranslation()

  const gridClass = viewMode === 'grid'
    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
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

  const getGradeColor = (gradeName: string) => {
    if (gradeName.includes('SD')) return 'bg-red-500';
    if (gradeName.includes('SMP')) return 'bg-blue-500';
    if (gradeName.includes('SMA') || gradeName.includes('MA')) return 'bg-[#0089BD]';
    if (gradeName.includes('SMK')) return 'bg-[#0089BD]';
    if (gradeName.includes('Umum')) return 'bg-purple-500';
    return 'bg-emerald-500';
  };

  const getGrade = (grade: string, prefix = '') => {
    const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
    if (grades.includes(grade)) return `${prefix}${grade}`;
    return '';
  }

  return (
    <div className={cn(
      "group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-primary/30 transition-all duration-300 overflow-hidden",
      isListView ? "flex flex-row h-auto min-h-[160px]" : "flex flex-col h-full"
    )}>
      {/* Image Container */}
      <div className={cn(
        "relative overflow-hidden bg-slate-100 dark:bg-slate-700",
        isListView ? "w-32 sm:w-48 shrink-0" : "aspect-[2/3] w-full max-h-[280px]"
      )}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{
            backgroundImage: `url("${getBookCover(book.bookId, "md")}")`,
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