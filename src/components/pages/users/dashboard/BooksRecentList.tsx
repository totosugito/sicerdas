import { useBookHistory } from "@/api/book";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { BookOpen, ChevronRight, Clock, GraduationCap, Eye, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { getBookDetailId } from "@/lib/book-utils";
import { Button } from "@/components/ui/button";
import { getGradeColor } from "@/lib/exam-utils";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { History } from "lucide-react";

import { LocalePagination } from "@/components/custom/components/LocalePagination";

interface BooksRecentListProps {
  page?: number;
  onPageChange?: (page: number) => void;
  limit?: number;
}

export const BooksRecentList = ({ page = 1, onPageChange, limit = 5 }: BooksRecentListProps) => {
  const { t } = useAppTranslation();

  const { data: res, isLoading } = useBookHistory({
    pageSize: limit,
    page: page
  });

  const recentBooks = res?.data || [];

  const renderContent = () => {
    // ... (renderContent logic remains same)
    if (isLoading) {
      return (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <Skeleton className="w-14 h-14 rounded-xl flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16 rounded-md" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-3 w-1/4 rounded-md" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-200" />
            </div>
          ))}
        </div>
      );
    }

    if (recentBooks.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/40 dark:to-blue-900/20 rounded-3xl flex items-center justify-center border border-blue-200/50 dark:border-blue-700/30 shadow-xl shadow-blue-500/10">
              <Clock className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t(($) => $.book.dashboard.history.empty)}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] mt-2 mb-6 font-medium leading-relaxed">
            {t(($) => $.book.dashboard.history.emptyDesc)}
          </p>
          {/* <Link to={AppRoute.book.books.url}>
            <Button variant="outline" className="px-8 transition-all duration-300">
              {t(($) => $.book.detail.backToBooks)}
            </Button>
          </Link> */}
        </div>
      );
    }

    return (
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {recentBooks.map((book) => (
          <Link
            key={book.id}
            to={AppRoute.book.detail.url}
            params={{ id: getBookDetailId(book.bookId, book.title) }}
            className="group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 transition-transform duration-300 group-hover:scale-105">
              {book.cover?.xs ? (
                <img
                  src={book.cover.xs}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-slate-400" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs font-black uppercase tracking-widest h-5 px-1.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700">
                  {book.category.name}
                </Badge>
                <span className={`text-xs font-bold flex items-center gap-1 ${getGradeColor(book.grade.name).replace("bg-", "text-")}`}>
                  <GraduationCap className="w-3 h-3" />
                  {book.grade.name}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white truncate group-hover:text-primary transition-colors leading-tight">
                {book.title}
              </h4>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1 truncate">
                {book.author}
              </p>

              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                  <Eye className="w-3 h-3" />
                  <span>{book.stats.viewCount} {t(($) => $.book.dashboard.stats.views)}</span>
                </div>

                {book.stats.isDownloaded && (
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-tight bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                    <Download className="w-3 h-3" />
                    <span>{t(($) => $.book.dashboard.stats.downloaded)}</span>
                  </div>
                )}
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
          </Link>
        ))}

        {res?.pagination && res.pagination.totalPages > 1 && onPageChange && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
            <LocalePagination
              currentPage={page}
              totalPages={res.pagination.totalPages}
              onPageChange={onPageChange}
              className="mt-0"
            />
          </div>
        )}

        {!onPageChange && (
          <Link
            to={AppRoute.book.books.url}
            className="flex items-center justify-center py-4 text-xs font-black uppercase tracking-widest text-primary hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-200"
          >
            {t(($) => $.book.detail.backToBooks)}
            <ChevronRight className="w-3 h-3 ml-1" />
          </Link>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b">
        <Link to={AppRoute.book.books.url} className="group block">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                <History className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{t(($) => $.book.dashboard.history.title)}</CardTitle>
                <CardDescription className="text-xs font-medium">{t(($) => $.book.dashboard.history.description)}</CardDescription>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
          </div>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>
    </Card>
  );
};
