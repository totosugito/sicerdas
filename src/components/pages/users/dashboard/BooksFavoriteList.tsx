import { useState, useEffect } from "react";
import { useFavoriteBooks, useBookmarkBook } from "@/api/book";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Badge } from "@/components/ui/badge";
import { Bookmark, BookOpen, X, ChevronRight, GraduationCap, Eye, Download } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { AppRoute } from "@/constants/app-route";
import { showNotifSuccess } from "@/lib/show-notif";
import { getBookDetailId } from "@/lib/book-utils";
import { DialogModal } from "@/components/custom/components/DialogModal";
import { useQueryClient } from "@tanstack/react-query";
import { LocalePagination } from "@/components/ui/locale-pagination";
import { getGradeColor } from "@/lib/exam-utils";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface BooksFavoriteListProps {
  page: number;
  onPageChange: (page: number) => void;
  limit?: number;
}

export const BooksFavoriteList = ({ page, onPageChange, limit }: BooksFavoriteListProps) => {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();

  const { data: res, isLoading } = useFavoriteBooks({
    limit: limit || 5,
    page: page
  });

  const { mutate: toggleBookmark } = useBookmarkBook();
  const favorites = res?.data || [];
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const selectedBook = favorites.find((b) => b.bookId === deleteId);

  // Handle page adjustment after deletion
  useEffect(() => {
    if (!isLoading && res?.pagination) {
      const { totalPages } = res.pagination;
      if (page > totalPages && totalPages > 0) {
        onPageChange(totalPages);
      }
    }
  }, [isLoading, res, page, onPageChange]);

  const handleRemove = (bookId: number) => {
    toggleBookmark(
      { bookId, bookmarked: false },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({ queryKey: ["book-favorites"] });
          queryClient.invalidateQueries({ queryKey: ["book-user-stats"] });
          showNotifSuccess({ message: data.message });
        },
      }
    );
  };

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
              <Skeleton className="w-4 h-4 rounded-full" />
            </div>
          ))}
        </div>
      );
    }

    if (favorites.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full" />
            <div className="relative w-20 h-20 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-900/20 rounded-3xl flex items-center justify-center border border-amber-200/50 dark:border-amber-700/30 shadow-xl shadow-amber-500/10">
              <Bookmark className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
            {t(($) => $.book.dashboard.favorites.empty)}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[280px] mt-2 mb-6 font-medium leading-relaxed">
            {t(($) => $.book.dashboard.favorites.emptyDesc)}
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
        {favorites.map((book) => (
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

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-slate-300 hover:text-destructive hover:bg-destructive/10 transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteId(book.bookId);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}

        {res?.pagination && res.pagination.totalPages > 1 && (
          <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-t border-slate-100 dark:border-slate-800">
            <LocalePagination
              currentPage={page}
              totalPages={res.pagination.totalPages}
              onPageChange={onPageChange}
              className="mt-0"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="shadow-sm overflow-hidden">
      <CardHeader className="bg-muted/10 border-b">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center">
            <Bookmark className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold">{t(($) => $.book.dashboard.favorites.title)}</CardTitle>
            <CardDescription className="text-xs font-medium">{t(($) => $.book.dashboard.favorites.description)}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {renderContent()}
      </CardContent>

      <DialogModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        modal={{
          title: t(($) => $.book.dashboard.favorites.removeConfirm),
          desc: t(($) => $.book.dashboard.favorites.removeConfirmDesc),
          textConfirm: t(($) => $.book.dashboard.favorites.removeAction),
          textCancel: t(($) => $.book.dashboard.favorites.cancelAction),
          iconType: "error",
          variant: "destructive",
          showInfoSection: !!selectedBook,
          infoItems: selectedBook ? [{ text: selectedBook.title }] : [],
          onConfirmClick: () => {
            if (deleteId) handleRemove(deleteId);
            setDeleteId(null);
          },
        }}
        variantSubmit="destructive"
      />
    </Card>
  );
};
