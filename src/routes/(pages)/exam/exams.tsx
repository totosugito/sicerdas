import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Trans } from "react-i18next";
import { useListPackageClient, ListPackagesClientResponse } from "@/api/exam-packages";
import { HelpCircle, LayoutGrid, ListIcon } from "lucide-react";
import { showNotifError } from "@/lib/show-notif";
import {
  ExamsSkeleton,
  ExamFilter,
  ExamCard,
  ExamSearchBar,
  ExamSortSelector,
} from "@/components/pages/exam/exams";
import { EnumViewMode } from "@/constants/app-enum";
import { DataTablePagination } from "@/components/custom/table";
import { useAppStore } from "@/stores/useAppStore";
import { Button } from "@/components/ui/button";
import { useAppTranslation } from "@/lib/i18n-typed";

export const Route = createFileRoute("/(pages)/exam/exams")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(1).max(50).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    categoryKey: z.string().optional().catch(undefined),
    grade: z.array(z.number()).optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { t } = useAppTranslation();
  const {
    page: urlPage,
    limit: urlLimit,
    search: urlSearch,
    categoryKey: urlCategoryKey,
    grade: urlGrade,
    sortBy: urlSortBy,
    sortOrder: urlSortOrder,
  } = Route.useSearch();

  const navigate = Route.useNavigate();
  const store = useAppStore();
  const pageStore = store.exams;

  type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];

  const [searchTerm, setSearchTerm] = useState(urlSearch ?? pageStore.search ?? "");
  const [currentPage, setCurrentPage] = useState(urlPage ?? pageStore.page ?? 1);
  const [viewMode, setViewMode] = useState<ViewMode>(pageStore.viewMode ?? EnumViewMode.grid.value);

  const sortBy = urlSortBy ?? pageStore.sortBy ?? "createdAt";
  const sortOrder = urlSortOrder ?? pageStore.sortOrder ?? "desc";
  const selectedFilters = {
    categoryKey: urlCategoryKey ?? pageStore.categoryKey ?? "",
    grades: urlGrade ?? pageStore.grade ?? [],
  };

  const {
    data: response,
    isLoading,
    isError,
  } = useListPackageClient({
    page: currentPage,
    limit: urlLimit ?? pageStore.limit ?? 12,
    search: searchTerm.trim() || undefined,
    categoryKey: selectedFilters.categoryKey || undefined,
    educationGradeIds: selectedFilters.grades.length > 0 ? selectedFilters.grades : undefined,
    sortBy,
    sortOrder,
  });

  useEffect(() => {
    if (isError) {
      showNotifError({ message: t(($) => $.exam.packages.list.error) });
    }
  }, [isError, t]);

  const updateUrlParams = (params: {
    page?: number;
    search?: string;
    categoryKey?: string;
    grades?: number[];
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) => {
    navigate({
      search: {
        page: params.page ?? currentPage,
        limit: urlLimit ?? pageStore.limit ?? 12,
        search: params.search !== undefined ? params.search : searchTerm,
        categoryKey:
          params.categoryKey !== undefined ? params.categoryKey : selectedFilters.categoryKey,
        grade: params.grades !== undefined ? params.grades : selectedFilters.grades,
        sortBy: params.sortBy !== undefined ? params.sortBy : sortBy,
        sortOrder: params.sortOrder !== undefined ? params.sortOrder : sortOrder,
      },
      replace: true,
    });
  };

  useEffect(() => {
    const effectivePage = urlPage ?? pageStore.page ?? 1;
    const effectiveLimit = urlLimit ?? pageStore.limit ?? 12;
    const effectiveSearch = urlSearch ?? pageStore.search ?? "";
    const effectiveCategoryKey = urlCategoryKey ?? pageStore.categoryKey ?? "";
    const effectiveGrades = urlGrade ?? pageStore.grade ?? [];
    const effectiveSortBy = urlSortBy ?? pageStore.sortBy ?? "createdAt";
    const effectiveSortOrder = urlSortOrder ?? pageStore.sortOrder ?? "desc";

    store.setExams({
      viewMode: pageStore.viewMode,
      limit: effectiveLimit,
      page: effectivePage,
      search: effectiveSearch,
      categoryKey: effectiveCategoryKey,
      grade: effectiveGrades,
      sortBy: effectiveSortBy,
      sortOrder: effectiveSortOrder,
    });

    setCurrentPage(effectivePage);
    setSearchTerm(effectiveSearch);
  }, [urlPage, urlSearch, urlCategoryKey, urlGrade, urlSortBy, urlSortOrder]);

  const handleSearch = (term: string) => {
    updateUrlParams({ page: 1, search: term });
  };

  const handlePageChange = (page: number) => {
    updateUrlParams({ page });
  };

  const handleFilterChange = (filters: { categoryKey: string; grades?: number[] }) => {
    updateUrlParams({ page: 1, ...filters });
  };

  const handleViewModeChange = (mode: ViewMode) => {
    store.setExams({ ...pageStore, viewMode: mode });
    setViewMode(mode);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    updateUrlParams({ page: 1, sortBy: newSortBy, sortOrder: newSortOrder });
  };

  const exams = response?.data?.items || [];
  const totalPages = response?.data?.meta?.totalPages || 0;
  const totalExams = response?.data?.meta?.total || 0;

  return (
    <div className="flex flex-col flex-1 w-full px-6 pb-6">
      <div className="flex flex-col lg:flex-row gap-6 pt-6">
        <aside className="hidden lg:block w-70 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <ExamFilter
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              idPrefix="sidebar"
            />
          </div>
        </aside>

        <div className="flex flex-col flex-1 gap-4">
          <div className="flex flex-col gap-6">
            {/* Search and Header Section */}
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 uppercase tracking-tight">
                    {t(($) => $.exam.packages.menu)}
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">
                    {t(($) => $.exam.packages.description)}
                  </p>
                </div>
              </div>

              <ExamSearchBar
                searchTerm={searchTerm}
                onSearchTermChange={setSearchTerm}
                onSearch={handleSearch}
                isSearchDisabled={isLoading}
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
              />
            </div>

            {/* View Toggles and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-8 w-1 bg-primary rounded-full" />
                {totalExams !== undefined && (
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    <Trans
                      i18nKey="exam.packages.table.sort.showingText"
                      values={{ count: exams.length, total: totalExams }}
                      components={{
                        bold: <span className="font-bold text-primary" />,
                      }}
                    />
                  </p>
                )}
              </div>

              <div className="flex items-center gap-4">
                <ExamSortSelector
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => handleViewModeChange?.("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="h-8 w-8 rounded-lg"
                    onClick={() => handleViewModeChange?.("list")}
                  >
                    <ListIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Exams Display */}
            {isLoading ? (
              <ExamsSkeleton viewMode={viewMode} length={8} />
            ) : exams.length > 0 ? (
              <ExamCard exams={exams} viewMode={viewMode} />
            ) : (
              /* Empty State */
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-50 dark:bg-slate-800 mb-6 group">
                  <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-600 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white mb-2">
                  {t(($) => $.exam.packages.table.noResult)}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm mx-auto font-medium">
                  {searchTerm
                    ? `${t(($) => $.exam.packages.table.noData)} "${searchTerm}"`
                    : t(($) => $.exam.packages.table.noData)}
                </p>
                {(searchTerm ||
                  selectedFilters.categoryKey ||
                  selectedFilters.grades.length > 0) && (
                  <Button
                    variant="outline"
                    className="rounded-xl px-8"
                    onClick={() => {
                      setSearchTerm("");
                      updateUrlParams({ page: 1, search: "", categoryKey: "", grades: [] });
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-8 mt-4 border-t border-slate-200 dark:border-slate-800">
              <DataTablePagination
                pageIndex={currentPage - 1}
                setPageIndex={(newPageIndex) => handlePageChange(newPageIndex + 1)}
                pageSize={urlLimit ?? pageStore.limit ?? 12}
                setPageSize={() => {}}
                rowsCount={totalExams}
                paginationData={{
                  page: currentPage,
                  limit: urlLimit ?? pageStore.limit ?? 12,
                  total: totalExams,
                  totalPages: totalPages,
                }}
                showPageSize={false}
                showPageLabel={false}
                disabled={isLoading}
                onPaginationChange={(paginationData) => {
                  handlePageChange(paginationData.page);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
