import React from "react";
import { LayoutGrid, List as ListIcon, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppTranslation } from "@/lib/i18n-typed";

import { DataTablePagination } from "@/components/custom/table/data-table-pagination";

interface ResultsQuestionReviewProps {
  totalQuestions: number;
  viewMode: "grid" | "list";
  setViewMode: (mode: "grid" | "list") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  grid: any[];
  filteredGrid: any[];
  onReview: (questionId: string) => void;
  selectedReviewId: string | null;
  getSnippet: (content: any[] | null) => string;
  page: number;
  setPage: (page: number) => void;
}

export const ResultsQuestionReview: React.FC<ResultsQuestionReviewProps> = ({
  totalQuestions,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  grid,
  filteredGrid,
  onReview,
  selectedReviewId,
  getSnippet,
  page,
  setPage,
}) => {
  const { t } = useAppTranslation();
  const pageSize = 10;

  const paginatedList = React.useMemo(() => {
    if (viewMode === "grid") return filteredGrid;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filteredGrid.slice(start, end);
  }, [filteredGrid, page, viewMode]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-black flex items-center gap-2">
          {t(($) => $.exam.sessions.results.reviewTitle)}
          <span className="text-sm font-bold text-muted-foreground bg-muted px-3 py-1 rounded-full">
            {totalQuestions} {t(($) => $.exam.sessions.cbt.question.title)}
          </span>
        </h2>

        <div className="flex items-center gap-2 bg-muted/50 p-1 rounded-md border self-start md:self-auto">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            className="rounded-lg h-9 gap-2"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
            {t(($) => $.exam.sessions.results.review.grid)}
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            className="rounded-lg h-9 gap-2"
            onClick={() => setViewMode("list")}
          >
            <ListIcon className="w-4 h-4" />
            {t(($) => $.exam.sessions.results.review.list)}
          </Button>
        </div>
      </div>

      {viewMode === "list" && (
        <div className="relative animate-in fade-in slide-in-from-top-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder={t(($) => $.exam.sessions.results.review.searchPlaceholder)}
            className="pl-10 h-11"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {viewMode === "grid" ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(48px,1fr))] gap-2 animate-in fade-in duration-500">
          {grid.map((item) => (
            <button
              key={item.questionId}
              onClick={() => onReview(item.questionId)}
              className={`aspect-square rounded-md flex items-center justify-center text-sm font-bold border-2 transition-all duration-200 ${selectedReviewId === item.questionId
                  ? "border-primary bg-primary/20 scale-115 z-10 shadow-lg"
                  : item.isCorrect === true
                    ? "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400"
                    : item.isCorrect === false
                      ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                      : "bg-muted border-border text-muted-foreground"
                }`}
            >
              {item.order}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="space-y-3">
            {paginatedList.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground bg-muted/20 rounded-2xl border border-dashed">
                {t(($) => $.exam.sessions.results.review.emptySearch)}
              </div>
            ) : (
              paginatedList.map((item) => (
                <div
                  key={item.questionId}
                  role="button"
                  tabIndex={0}
                  onClick={() => onReview(item.questionId)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      onReview(item.questionId);
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-md border-2 text-left transition-all cursor-pointer hover:bg-muted/30 group ${selectedReviewId === item.questionId
                      ? "border-primary bg-primary/5"
                      : "border-border/50 hover:border-primary/20"
                    }`}
                >
                  <div
                    className={`w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0 font-black text-lg ${item.isCorrect === true
                        ? "bg-green-500 text-white"
                        : item.isCorrect === false
                          ? "bg-red-500 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                  >
                    {item.order}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground line-clamp-2 leading-relaxed">
                      {getSnippet(item.questionContent)}
                    </p>
                  </div>
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="text-xs font-bold"
                    >
                      {t(($) => $.exam.sessions.results.review.button)}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredGrid.length > pageSize && (
            <div className="pt-4 border-t">
              <DataTablePagination
                pageIndex={page - 1}
                setPageIndex={(idx) => setPage(idx + 1)}
                pageSize={pageSize}
                setPageSize={() => { }}
                rowsCount={filteredGrid.length}
                showPageSize={false}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
