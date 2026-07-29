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
  CourseToolbar,
} from "@/features/course/courses/list-course";
import { PaginationData, DataTablePagination } from "@/components/table";
import { Plus, Trash2 } from "lucide-react";
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
    categoryId: z.string().optional().catch(undefined),
    educationGradeId: z.string().optional().catch(undefined),
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
  const categoryId = searchParams.categoryId;
  const educationGradeId = searchParams.educationGradeId;

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
    categoryId: categoryId || undefined,
    educationGradeId: educationGradeId ? Number(educationGradeId) : undefined,
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

  const handleSearchSubmit = () => {
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

      <CourseToolbar
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onSearchSubmit={handleSearchSubmit}
        onClearSearch={handleClearSearch}
        status={status}
        onStatusChange={(newStatus) =>
          navigate({
            search: { ...searchParams, status: newStatus, page: 1 },
            replace: true,
          })
        }
        sortBy={sortBy}
        sortOrder={sortOrder as "asc" | "desc"}
        onSortChange={(newSortBy, newSortOrder) =>
          navigate({
            search: {
              ...searchParams,
              sortBy: newSortBy,
              sortOrder: newSortOrder,
              page: 1,
            },
            replace: true,
          })
        }
        viewMode={viewMode}
        onViewModeChange={(newView) =>
          navigate({ search: { ...searchParams, view: newView }, replace: true })
        }
        categoryId={categoryId}
        gradeId={educationGradeId}
        onCategoryChange={(newCategoryId) =>
          navigate({
            search: { ...searchParams, categoryId: newCategoryId, page: 1 },
            replace: true,
          })
        }
        onGradeChange={(newGradeId) =>
          navigate({
            search: { ...searchParams, educationGradeId: newGradeId, page: 1 },
            replace: true,
          })
        }
      />

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
