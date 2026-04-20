import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { Trans } from "react-i18next";
import { useListPackageClient, useExamFilterParams } from "@/api/exam-packages";
import { LayoutGrid, ListIcon } from "lucide-react";
import { showNotifError } from "@/lib/show-notif";
import {
  PackageSkeleton,
  PackageEmptyState,
  PackageFilter,
  PackageCard,
  PackageSearchBar,
  PackageSortSelector,
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

  const filterParamsQuery = useExamFilterParams();

  const [sortBy, setSortBy] = useState(urlSortBy ?? pageStore.sortBy ?? "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    urlSortOrder ?? pageStore.sortOrder ?? "desc",
  );

  const selectedFilters = {
    categoryKey: urlCategoryKey ?? pageStore.categoryKey ?? "",
    grades: urlGrade ?? pageStore.grade ?? [],
  };

  const packageQuery = useListPackageClient({
    page: currentPage,
    limit: urlLimit ?? pageStore.limit ?? 12,
    search: searchTerm.trim() || undefined,
    categoryKey: selectedFilters.categoryKey || undefined,
    educationGradeIds: selectedFilters.grades.length > 0 ? selectedFilters.grades : undefined,
    sortBy,
    sortOrder,
  });

  const isLoading = packageQuery.isLoading;
  const isError = packageQuery.isError;
  const response = packageQuery.data;
  const exams = response?.data?.items || [];
  const totalPages = response?.data?.meta?.totalPages || 0;
  const totalExams = response?.data?.meta?.total || 0;

  const updateUrlParams = (
    newPage?: number,
    newSearch?: string,
    newFilters?: { categoryKey: string; grades?: number[] },
    newSortBy?: string,
    newSortOrder?: "asc" | "desc",
  ) => {
    navigate({
      search: {
        page: newPage || currentPage,
        limit: urlLimit ?? pageStore.limit ?? 12,
        search: newSearch !== undefined ? newSearch : searchTerm,
        categoryKey:
          newFilters?.categoryKey !== undefined
            ? newFilters.categoryKey
            : selectedFilters.categoryKey,
        grade: newFilters?.grades !== undefined ? newFilters.grades : selectedFilters.grades,
        sortBy: newSortBy !== undefined ? newSortBy : sortBy,
        sortOrder: newSortOrder !== undefined ? newSortOrder : sortOrder,
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
    setSortBy(effectiveSortBy);
    setSortOrder(effectiveSortOrder);

    if (isError) {
      showNotifError({ message: t(($) => $.exam.packages.list.error) });
    }
  }, [urlPage, urlSearch, urlCategoryKey, urlGrade, urlSortBy, urlSortOrder, isError]);

  const handleSearch = (term: string = searchTerm) => {
    updateUrlParams(1, term);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams(page, searchTerm);
  };

  const handleFilterChange = (filters: { categoryKey: string; grades?: number[] }) => {
    updateUrlParams(1, searchTerm, filters);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    store.setExams({ ...pageStore, viewMode: mode });
    setViewMode(mode);
  };

  const isAnyFilterActive = !!(
    selectedFilters.categoryKey !== "" || selectedFilters.grades.length > 0
  );

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    updateUrlParams(1, searchTerm, selectedFilters, newSortBy, newSortOrder);
  };

  return (
    <div className="flex flex-col flex-1 w-full px-6 pb-6">
      <div className="flex flex-col lg:flex-row gap-6 pt-6">
        <aside className="hidden lg:block w-70 flex-shrink-0">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <PackageFilter
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              autoSubmit={true}
              filterData={filterParamsQuery.data}
              idPrefix="sidebar"
            />
          </div>
        </aside>

        {/* Exam List Content */}
        <div className="flex flex-col flex-1 gap-4">
          {/* Loading State */}
          {isLoading && (
            <PackageSkeleton viewMode={viewMode === "grid" ? "grid" : "list"} length={6} />
          )}

          <div className="flex flex-col gap-4">
            {/* Search Bar */}
            <PackageSearchBar
              searchTerm={searchTerm}
              onSearchTermChange={setSearchTerm}
              onSearch={handleSearch}
              isSearchDisabled={isLoading}
              selectedFilters={selectedFilters}
              onFilterChange={handleFilterChange}
              filterData={filterParamsQuery.data}
            />

            {/* View Toggles and Results Count */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              {totalExams !== undefined && (
                <p className="text-slate-500 dark:text-slate-400">
                  <Trans
                    i18nKey="exam.packages.table.sort.showingText"
                    values={{ count: exams.length, total: totalExams }}
                    components={{
                      bold: <span className="font-bold text-slate-900 dark:text-white" />,
                    }}
                  />
                </p>
              )}

              <div className="flex items-center gap-4">
                <PackageSortSelector
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                  onSortChange={handleSortChange}
                />
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    className="h-7 w-7"
                    onClick={() => handleViewModeChange?.("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    className="h-7 w-7"
                    onClick={() => handleViewModeChange?.("list")}
                  >
                    <ListIcon className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Exams Display */}
            {!isLoading && exams.length > 0 && (
              <PackageCard exams={exams} viewMode={viewMode === "grid" ? "grid" : "list"} />
            )}
          </div>

          {/* Empty State */}
          {!isLoading && exams.length === 0 && (
            <PackageEmptyState
              searchTerm={searchTerm}
              hasActiveFilters={isAnyFilterActive}
              onReset={() => {
                if (searchTerm) {
                  setSearchTerm("");
                  updateUrlParams(1, "");
                } else if (isAnyFilterActive) {
                  updateUrlParams(1, searchTerm, { categoryKey: "", grades: [] });
                }
              }}
            />
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
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
