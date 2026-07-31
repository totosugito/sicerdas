import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useListCourseClient, useCourseFilterParams } from "@/api/course/courses";
import { BookOpen } from "lucide-react";
import { showNotifError } from "@/lib/show-notif";
import {
  CoursesSkeleton,
  CourseFilter,
  CourseCard,
  CourseSearchBar,
  CourseSortSelector,
} from "@/features/course/courses/public-list";
import { EmptyState } from "@/components/general/EmptyState";
import { Card, CardContent } from "@/components/ui/card";
import { EnumViewMode } from "@/constants/app-enum";
import { DataTablePagination } from "@/components/table";
import { Button } from "@/components/ui/button";
import { useAppTranslation, getTranslationKey } from "@/lib/i18n-typed";
import { Trans } from "react-i18next";
import { ViewModeToggle } from "@/features/components";

export const Route = createFileRoute("/(pages)/(course)/courses")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(1).max(20).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    category: z.array(z.string()).optional().catch(undefined),
    grade: z.array(z.number()).optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
  }),
  component: RouteComponent,
});

type ViewMode = (typeof EnumViewMode)[keyof typeof EnumViewMode]["value"];

function RouteComponent() {
  const { t } = useAppTranslation();
  const {
    page: urlPage,
    limit: urlLimit,
    search: urlSearch,
    category: urlCategory,
    grade: urlGrade,
    sortBy: urlSortBy,
    sortOrder: urlSortOrder,
  } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [searchTerm, setSearchTerm] = useState(urlSearch ?? "");
  const [currentPage, setCurrentPage] = useState(urlPage ?? 1);
  const [sortBy, setSortBy] = useState(urlSortBy ?? "createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(urlSortOrder ?? "desc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  const selectedFilters = {
    categories: urlCategory ?? [],
    grades: urlGrade ?? [],
  };

  const courseListQuery = useListCourseClient({
    page: currentPage,
    limit: urlLimit ?? 12,
    search: searchTerm.trim() || undefined,
    categoryId: selectedFilters.categories[0] || undefined,
    educationGradeId: selectedFilters.grades[0] || undefined,
    sortBy,
    sortOrder,
  });

  const filterParamsQuery = useCourseFilterParams();

  const isLoading = courseListQuery.isLoading;
  const isError = courseListQuery.isError;
  const response = courseListQuery.data;
  const courses = response?.data?.items || [];
  const totalPages = response?.data?.meta?.totalPages || 0;
  const totalCourses = response?.data?.meta?.total || 0;

  const updateUrlParams = (
    newPage?: number,
    newSearch?: string,
    newFilters?: { categories: string[]; grades: number[] },
    newSortBy?: string,
    newSortOrder?: "asc" | "desc",
  ) => {
    navigate({
      search: {
        page: newPage || currentPage,
        limit: urlLimit ?? 12,
        search: newSearch !== undefined ? newSearch : searchTerm,
        category: newFilters?.categories || selectedFilters.categories,
        grade: newFilters?.grades || selectedFilters.grades,
        sortBy: newSortBy !== undefined ? newSortBy : sortBy,
        sortOrder: newSortOrder !== undefined ? newSortOrder : sortOrder,
      },
      replace: true,
    });
  };

  useEffect(() => {
    const effectivePage = urlPage ?? 1;
    const effectiveSearch = urlSearch ?? "";
    const effectiveSortBy = urlSortBy ?? "createdAt";
    const effectiveSortOrder = urlSortOrder ?? "desc";

    setCurrentPage(effectivePage);
    setSearchTerm(effectiveSearch);
    setSortBy(effectiveSortBy);
    setSortOrder(effectiveSortOrder);

    if (isError) {
      showNotifError({ message: t(($) => $.labels.error) });
    }
  }, [urlPage, urlSearch, urlSortBy, urlSortOrder, isError]);

  const handleSearch = (term: string = searchTerm) => {
    updateUrlParams(1, term);
  };

  const handlePageChange = (page: number) => {
    updateUrlParams(page, searchTerm);
  };

  const handleFilterChange = (filters: {
    categories: string[];
    grades: number[];
  }) => {
    updateUrlParams(1, searchTerm, filters);
  };

  const handleSortChange = (newSortBy: string, newSortOrder: "asc" | "desc") => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    updateUrlParams(1, searchTerm, selectedFilters, newSortBy, newSortOrder);
  };

  const isAnyFilterActive = !!(
    selectedFilters.categories.length > 0 ||
    selectedFilters.grades.length > 0
  );

  return (
    <div className="flex flex-col flex-1 w-full px-6 pb-6">
      <div className="flex flex-col lg:flex-row gap-6 pt-6">
        {/* Sidebar Filters */}
        <aside className="hidden lg:block w-70 flex-shrink-0">
          <Card>
            <CardContent className="p-5">
              <CourseFilter
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                autoSubmit={true}
                filterData={filterParamsQuery.data}
                idPrefix="sidebar"
              />
            </CardContent>
          </Card>
        </aside>

        {/* Content Area */}
        <div className="flex flex-col flex-1 gap-4">
          {/* Search Bar */}
          <CourseSearchBar
            searchTerm={searchTerm}
            onSearchTermChange={setSearchTerm}
            onSearch={handleSearch}
            isSearchDisabled={isLoading}
            filterData={filterParamsQuery.data}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />

          {/* View Toggles & Results Count */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {totalCourses !== undefined && (
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                <Trans
                  i18nKey={getTranslationKey(($) => $.course.public.showingStats)}
                  values={{ count: courses.length, total: totalCourses }}
                  components={{
                    Bold: <span className="font-bold text-slate-900 dark:text-white" />,
                  }}
                />
              </p>
            )}

            <div className="flex items-center gap-4">
              <CourseSortSelector
                sortBy={sortBy}
                sortOrder={sortOrder}
                onSortChange={handleSortChange}
              />
              <ViewModeToggle
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                iconOnly
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && <CoursesSkeleton viewMode={viewMode} length={8} />}

          {/* Courses Display */}
          {!isLoading && courses.length > 0 && (
            <CourseCard courses={courses} viewMode={viewMode === "grid" ? "grid" : "list"} />
          )}

          {/* Empty State */}
          {!isLoading && courses.length === 0 && (
            <EmptyState
              icon={BookOpen}
              title={t(($) => $.course.public.notFound)}
              description={
                searchTerm
                  ? t(($) => $.course.public.noSearchDesc, { search: searchTerm })
                  : t(($) => $.course.public.noDataDesc)
              }
            >
              {(searchTerm || isAnyFilterActive) && (
                <Button
                  variant="outline"
                  onClick={() => {
                    if (searchTerm) {
                      setSearchTerm("");
                      updateUrlParams(1, "");
                    } else if (isAnyFilterActive) {
                      updateUrlParams(1, searchTerm, { categories: [], grades: [] });
                    }
                  }}
                >
                  {t(($) => $.course.public.clearSearch)}
                </Button>
              )}
            </EmptyState>
          )}

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <DataTablePagination
                pageIndex={currentPage - 1}
                setPageIndex={(newPageIndex) => handlePageChange(newPageIndex + 1)}
                pageSize={12}
                setPageSize={() => { }}
                rowsCount={totalCourses}
                paginationData={{
                  page: currentPage,
                  limit: urlLimit ?? 12,
                  total: totalCourses,
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
