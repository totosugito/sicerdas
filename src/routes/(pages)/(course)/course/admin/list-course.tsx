import { createFileRoute } from "@tanstack/react-router";
import {
  useListCourse,
  useDeleteCourse,
  CourseItem,
  PaginatedCourseListResponse,
} from "@/api/course/courses";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useEffect, useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app";
import { DialogModal } from "@/components/dialog";
import { useAppStore } from "@/stores/useAppStore";
import {
  CourseTable,
  CourseCardList,
  CourseSortSelector,
} from "@/features/course/courses/list-course";
import { EnumContentStatus } from "@/api/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectPositioner,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LayoutGrid, ListIcon, Plus, Trash2, Search, X, BookOpen, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { PaginationData, DataTablePagination } from "@/components/table";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(pages)/(course)/course/admin/list-course")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    status: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
    view: z.enum(["table", "card"]).optional().catch(undefined),
  }),
  component: AdminCourseListPage,
});

function AdminCourseListPage() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const status = searchParams.status ?? "";
  const sortBy = searchParams.sortBy ?? "updatedAt";
  const sortOrder = searchParams.sortOrder ?? "desc";
  const viewMode = searchParams.view ?? "card";

  const { courses, setCourses } = useAppStore();
  const [searchTerm, setSearchTerm] = useState(search);

  // Modal & Dialog States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<CourseItem | null>(null);

  // Sync with store on mount - if view is missing, use store value
  useEffect(() => {
    if (!searchParams.view) {
      navigate({
        search: { ...searchParams, view: courses.viewMode },
        replace: true,
      });
    }
  }, []);

  // Sync store with current URL params
  useEffect(() => {
    setCourses({
      viewMode,
      limit: searchParams.limit ?? 10,
      sortBy,
      sortOrder,
      search: searchParams.search ?? "",
    });
  }, [viewMode, searchParams.limit, sortBy, sortOrder, searchParams.search]);

  const { data, isLoading } = useListCourse({
    page,
    limit,
    search: search || undefined,
    status: (status as any) || undefined,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteCourse();

  const handleDelete = (course: CourseItem) => {
    setSelectedCourse(course);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedCourse) return;
    deleteMutation.mutate(selectedCourse.id, {
      onSuccess: (res) => {
        if (res.success) {
          showNotifSuccess({ message: res.message });
          queryClient.invalidateQueries({ queryKey: ["admin-course-courses-list"] });
        } else {
          showNotifError({ message: res.message });
        }
        setShowDeleteDialog(false);
        setSelectedCourse(null);
      },
      onError: (error) => {
        showNotifError({ message: error.message });
        setShowDeleteDialog(false);
        setSelectedCourse(null);
      },
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({
      search: {
        ...searchParams,
        search: searchTerm || undefined,
        page: 1,
      },
      replace: true,
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    navigate({
      search: {
        ...searchParams,
        search: undefined,
        page: 1,
      },
      replace: true,
    });
  };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          title={t(($) => $.course.courses.title)}
          description={t(($) => $.course.courses.description)}
        />
        <Button variant="default" onClick={() => navigate({ to: AppRoute.course.courses.admin.create.url })}>
          <Plus className="mr-2 h-4 w-4" />
          {t(($) => $.labels.add)}
        </Button>
      </div>

      {/* Unified Toolbar Container */}
      <div className="flex flex-col lg:flex-row items-center gap-4 bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t(($) => $.course.courses.table.search)}
            className="pl-10 h-10 bg-background/50 border-border/60 rounded-xl focus-visible:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate({
                  search: { ...searchParams, search: searchTerm || undefined, page: 1 },
                  replace: true,
                });
              }
            }}
          />
          {searchTerm && (
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              onClick={handleClearSearch}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto lg:ml-auto">
          {/* Status Filter */}
          <Select
            value={status || "all"}
            onValueChange={(val) => {
              const newStatus = val === "all" ? undefined : val;
              navigate({
                search: {
                  ...searchParams,
                  status: newStatus,
                  page: 1,
                },
                replace: true,
              });
            }}
          >
            <SelectTrigger className="w-[160px] bg-card shadow-sm border-border/60 flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <SelectValue
                placeholder={t(($) => $.course.courses.table.columns.status)}
                render={(_, { value }) => {
                  const label =
                    !value || value === "all"
                      ? t(($) => $.course.courses.table.statusFilter)
                      : t(
                          ($) =>
                            $.labels.statusValues[
                              value as keyof typeof $.labels.statusValues
                            ]
                        ) || value;
                  return <span className="text-left truncate block w-full">{label}</span>;
                }}
              />
            </SelectTrigger>
            <SelectPositioner>
              <SelectContent>
                <SelectItem value="all">
                  {t(($) => $.course.courses.table.statusFilter)}
                </SelectItem>
                {Object.values(EnumContentStatus).map((st) => (
                  <SelectItem key={st} value={st}>
                    {t(($) => $.labels.statusValues[st as keyof typeof $.labels.statusValues]) || st}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectPositioner>
          </Select>

          <CourseSortSelector
            sortBy={sortBy}
            sortOrder={sortOrder as "asc" | "desc"}
            onSortChange={(newSortBy, newSortOrder) => {
              navigate({
                search: {
                  ...searchParams,
                  sortBy: newSortBy,
                  sortOrder: newSortOrder,
                  page: 1,
                },
                replace: true,
              });
            }}
          />

          <div className="h-8 w-px bg-border/60 mx-1 hidden sm:block" />

          {/* View Mode Selector (Table / Card) */}
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
                viewMode === "table" ? "bg-background shadow-sm" : ""
              )}
              onClick={() => navigate({ search: { ...searchParams, view: "table" }, replace: true })}
            >
              <ListIcon className="h-3.5 w-3.5" />
              <span>{t(($) => $.course.courses.table.viewModes.table)}</span>
            </Button>
            <Button
              variant={viewMode === "card" ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-8 px-3 rounded-lg font-bold text-xs gap-2 transition-all",
                viewMode === "card" ? "bg-background shadow-sm" : ""
              )}
              onClick={() => navigate({ search: { ...searchParams, view: "card" }, replace: true })}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>{t(($) => $.course.courses.table.viewModes.card)}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content Area: Table / Card Grid */}
      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "table"
            ? "bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            : "flex flex-col gap-4"
        )}
      >
        <div className={cn(viewMode === "table" ? "p-4" : "")}>
          {viewMode === "table" ? (
            <CourseTable
              data={data as PaginatedCourseListResponse}
              isLoading={isLoading}
              paginationData={(data?.data?.meta as PaginationData) || { page, limit, total: 0, totalPages: 0 }}
              setSearch={(newSearch) => {
                navigate({
                  search: {
                    ...searchParams,
                    search: newSearch || undefined,
                    page: 1,
                  },
                  replace: true,
                });
              }}
              sortBy={sortBy}
              sortOrder={sortOrder as "asc" | "desc"}
              onSortChange={(newSortBy, newSortOrder) => {
                navigate({
                  search: {
                    ...searchParams,
                    sortBy: newSortBy,
                    sortOrder: newSortOrder,
                    page: 1,
                  },
                  replace: true,
                });
              }}
              onDelete={handleDelete}
              showPagination={false}
            />
          ) : (
            <CourseCardList
              data={data as PaginatedCourseListResponse}
              isLoading={isLoading}
              paginationData={(data?.data?.meta as PaginationData) || { page, limit, total: 0, totalPages: 0 }}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Adaptive Pagination Footer */}
        {!isLoading && data?.data?.meta && (
          <div
            className={cn(
              "transition-all duration-300",
              viewMode === "table"
                ? "px-6 pb-6 pt-2 border-t border-border/40 bg-muted/5"
                : "bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm"
            )}
          >
            <DataTablePagination
              paginationData={data.data.meta as PaginationData}
              pageIndex={((data.data.meta as PaginationData).page || 1) - 1}
              setPageIndex={() => {}}
              pageSize={(data.data.meta as PaginationData).limit || 10}
              setPageSize={() => {}}
              rowsCount={(data.data.meta as PaginationData).total || 0}
              onPaginationChange={(pagination: { page: number; limit: number }) => {
                navigate({
                  search: {
                    ...searchParams,
                    page: pagination.page,
                    limit: pagination.limit,
                  },
                  replace: true,
                });
              }}
              showPageSize={true}
              showPageLabel={true}
            />
          </div>
        )}
      </div>

      {/* Delete Course Confirmation Dialog */}
      <DialogModal
        variantSubmit="destructive"
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.course.courses.delete.confirmTitle),
          desc: (
            <span>
              {t(($) => $.course.courses.delete.confirmDesc)}{" "}
              <strong className="font-bold text-foreground underline decoration-destructive/40 underline-offset-2">
                {selectedCourse?.courseName}
              </strong>
              ?
            </span>
          ),
          infoContainer: t(($) => $.course.courses.delete.deleteInfo),
          infoContainerVariant: "error",
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          textCancel: t(($) => $.labels.cancel),
          textConfirm: t(($) => $.labels.delete),
          onConfirmClick: confirmDelete,
        }}
      />
    </div>
  );
}
