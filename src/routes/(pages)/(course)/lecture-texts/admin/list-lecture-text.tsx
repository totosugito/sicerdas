import { createFileRoute } from "@tanstack/react-router";
import {
  useListLectureText,
  useDeleteLectureText,
  LectureTextItem,
  PaginatedLectureTextListResponse,
} from "@/api/course/lecture-texts";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle, EmptyState } from "@/components/general";
import {
  LectureTextTable,
  LectureTextCard,
  LectureTextToolbar,
} from "@/features/course/lecture-texts";
import { DialogLectureTextPreview } from "@/features/course/lecture-texts/DialogLectureTextPreview";
import { DialogLectureTextDelete } from "@/features/course/lecture-texts/DialogLectureTextDelete";
import { Plus, FileText } from "lucide-react";
import { DataTablePagination, PaginationData } from "@/components/table";
import { useAuthStore } from "@/stores/useAuthStore";
import { CardListSkeleton, TableSkeleton } from "@/features/components";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";
import { cn } from "@/lib/utils";

export const Route = createFileRoute(
  "/(pages)/(course)/lecture-texts/admin/list-lecture-text",
)({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    view: z.enum(["table", "card"]).optional().catch(undefined),
    categoryId: z.string().optional().catch(undefined),
    educationGradeId: z.string().optional().catch(undefined),
    status: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
  }),
  component: AdminLectureTextListPage,
});

function AdminLectureTextListPage() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const viewMode = searchParams.view ?? "card";
  const categoryId = searchParams.categoryId;
  const educationGradeId = searchParams.educationGradeId;
  const status = searchParams.status;
  const sortBy = searchParams.sortBy ?? "createdAt";
  const sortOrder = searchParams.sortOrder ?? "desc";

  const [searchTerm, setSearchTerm] = useState(search);
  const [selectedArticle, setSelectedArticle] = useState<LectureTextItem | null>(null);
  const { openSideMenu } = useAuthStore();

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data, isLoading } = useListLectureText({
    page,
    limit,
    search: search || undefined,
    categoryId: categoryId || undefined,
    educationGradeId: educationGradeId ? Number(educationGradeId) : undefined,
    status: status || undefined,
    sortBy: sortBy || undefined,
    sortOrder: sortOrder || undefined,
  });

  const deleteMutation = useDeleteLectureText();

  const handlePreview = (article: LectureTextItem) => {
    setSelectedArticle(article);
    setShowPreviewModal(true);
  };

  const handleDelete = (article: LectureTextItem) => {
    setSelectedArticle(article);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedArticle) return;
    deleteMutation.mutate(selectedArticle.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message });
        queryClient.invalidateQueries({ queryKey: ["admin-course-lecture-texts-list"] });
        setShowDeleteDialog(false);
        setSelectedArticle(null);
      },
      onError: (error) => {
        showNotifError({ message: error.message });
        setShowDeleteDialog(false);
        setSelectedArticle(null);
      },
    });
  };

  const handleSearchSubmit = () => {
    navigate({
      search: { ...searchParams, search: searchTerm || undefined, page: 1 },
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

  const items = data?.data?.items || [];
  const meta = data?.data?.meta || { total: 0, page: 1, limit: 10, totalPages: 1 };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle
          title={t(($) => $.course.lectureTexts.title)}
          description={t(($) => $.course.lectureTexts.description)}
        />
        <Button
          variant="default"
          onClick={() => navigate({ to: AppRoute.course.lectureTexts.admin.create.url })}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t(($) => $.labels.add)}
        </Button>
      </div>

      {/* Toolbar Component */}
      <LectureTextToolbar
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
        sortOrder={sortOrder}
        onSortChange={(newSortBy, newSortOrder) =>
          navigate({
            search: { ...searchParams, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 },
            replace: true,
          })
        }
        viewMode={viewMode}
        onViewModeChange={(newView) =>
          navigate({
            search: { ...searchParams, view: newView },
            replace: true,
          })
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
        onClearFilters={() =>
          navigate({
            search: { ...searchParams, categoryId: undefined, educationGradeId: undefined, page: 1 },
            replace: true,
          })
        }
        disabled={isLoading}
      />

      {/* Main Content Area: Table / Card Grid */}
      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "table"
            ? "bg-card rounded-2xl border border-border shadow-xs overflow-hidden"
            : "flex flex-col gap-4",
        )}
      >
        <div className={cn(viewMode === "table" ? "p-4" : "")}>
          {isLoading ? (
            viewMode === "table" ? (
              <TableSkeleton columnCount={5} rowCount={limit} showSearch={false} />
            ) : (
              <CardListSkeleton count={limit} />
            )
          ) : !data || items.length === 0 ? (
            <EmptyState
              icon={FileText}
              title={t(($) => $.course.lectureTexts.table.noData)}
              description={t(($) => $.course.lectureTexts.description)}
            />
          ) : viewMode === "card" ? (
            <div className={cn(gridClass)}>
              {items.map((item) => (
                <LectureTextCard
                  key={item.id}
                  article={item}
                  onPreview={handlePreview}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <LectureTextTable
              data={data as PaginatedLectureTextListResponse}
              isLoading={isLoading}
              paginationData={meta as PaginationData}
              sortBy={sortBy}
              sortOrder={sortOrder}
              onSortChange={(newSortBy, newSortOrder) =>
                navigate({
                  search: { ...searchParams, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 },
                  replace: true,
                })
              }
              onPreview={handlePreview}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Adaptive Pagination Footer */}
        {!isLoading && items.length > 0 && meta.total > 0 && (
          <div
            className={cn(
              "transition-all duration-300",
              viewMode === "table"
                ? "px-6 pb-6 pt-2 border-t border-border/40 bg-muted/5"
                : "bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-xs",
            )}
          >
            <DataTablePagination
              paginationData={{
                page: meta.page,
                limit: meta.limit,
                total: meta.total,
                totalPages: meta.totalPages,
              }}
              pageIndex={meta.page - 1}
              setPageIndex={(newPageIndex: number) =>
                navigate({
                  search: { ...searchParams, page: newPageIndex + 1 },
                  replace: true,
                })
              }
              pageSize={meta.limit}
              setPageSize={(newPageSize: number) =>
                navigate({
                  search: { ...searchParams, limit: newPageSize, page: 1 },
                  replace: true,
                })
              }
              rowsCount={meta.total}
              onPaginationChange={(paginationData: { page: number; limit: number }) =>
                navigate({
                  search: { ...searchParams, page: paginationData.page, limit: paginationData.limit },
                  replace: true,
                })
              }
              showPageSize={true}
              showPageLabel={true}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <DialogLectureTextPreview
        open={showPreviewModal}
        onOpenChange={setShowPreviewModal}
        article={selectedArticle}
      />

      <DialogLectureTextDelete
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        article={selectedArticle}
        onConfirm={confirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
