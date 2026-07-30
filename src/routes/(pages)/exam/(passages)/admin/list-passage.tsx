import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useListPassage,
  useDeletePassage,
  ExamPassage,
  ListPassagesResponse,
} from "@/api/exam/passages";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useEffect, useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle, EmptyState } from "@/components/general";
import { Plus, Trash2, BookOpen } from "lucide-react";
import { DialogModal } from "@/components/dialog";
import {
  PassageTable,
  PassageCardListItem,
  PassageToolbar,
} from "@/features/exam/passages";
import { PaginationData, DataTablePagination } from "@/components/table";
import { useAppStore } from "@/stores/useAppStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { CardListSkeleton, TableSkeleton } from "@/features/components";
import { cn } from "@/lib/utils";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";

export const Route = createFileRoute("/(pages)/exam/(passages)/admin/list-passage")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
    subjectId: z.uuid().optional().catch(undefined),
    view: z.enum(["table", "card"]).optional().catch(undefined),
  }),
  component: AdminExamPassagesPage,
});

function AdminExamPassagesPage() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  // States for pagination, search, and sorting
  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const sortBy = searchParams.sortBy ?? "updatedAt";
  const sortOrder = searchParams.sortOrder ?? "desc";
  const viewMode = searchParams.view ?? "card";
  const subjectId = searchParams.subjectId;

  const { examPassages, setExamPassages } = useAppStore();
  const { openSideMenu } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState(search);

  const gridClass = openSideMenu
    ? "grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // Sync with store on mount - if view is missing, use store value
  useEffect(() => {
    if (!searchParams.view) {
      navigate({
        search: { ...searchParams, view: examPassages.viewMode },
        replace: true,
      });
    }
  }, []);

  // Sync store with current URL params
  useEffect(() => {
    setExamPassages({
      viewMode,
      limit: searchParams.limit ?? 10,
      sortBy: sortBy,
      sortOrder: sortOrder,
      search: searchParams.search ?? "",
    });
  }, [viewMode, searchParams.limit, sortBy, sortOrder, searchParams.search]);

  // API Hooks
  const { data, isLoading } = useListPassage({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    subjectId,
  });

  const deleteMutation = useDeletePassage();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedPassage, setSelectedPassage] = useState<ExamPassage | null>(null);

  // Handlers
  const handleDelete = (passage: ExamPassage) => {
    setSelectedPassage(passage);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedPassage) return;
    deleteMutation.mutate(selectedPassage.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.exam.passages.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-passages-list"] });
        setShowDeleteDialog(false);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-start">
        <PageTitle
          title={t(($) => $.exam.passages.title)}
          description={<span>{t(($) => $.exam.passages.description)}</span>}
        />
        <Button render={<Link to={AppRoute.exam.passages.admin.create.url} />} nativeButton={false} className="flex-shrink-0 gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
        </Button>
      </div>

      <PassageToolbar
        searchTerm={searchTerm}
        onSearchTermChange={(val) => {
          setSearchTerm(val);
          navigate({
            search: { ...searchParams, search: val || undefined, page: 1 },
            replace: true,
          });
        }}
        onSearchSubmit={() => {
          navigate({
            search: { ...searchParams, search: searchTerm || undefined, page: 1 },
            replace: true,
          });
        }}
        onClearSearch={() => {
          setSearchTerm("");
          navigate({
            search: { ...searchParams, search: undefined, page: 1 },
            replace: true,
          });
        }}
        sortBy={sortBy}
        sortOrder={sortOrder as "asc" | "desc"}
        onSortChange={(newSortBy, newSortOrder) => {
          navigate({
            search: { ...searchParams, sortBy: newSortBy, sortOrder: newSortOrder, page: 1 },
            replace: true,
          });
        }}
        viewMode={viewMode}
        onViewModeChange={(newView) => {
          navigate({ search: { ...searchParams, view: newView }, replace: true });
        }}
        disabled={isLoading}
      />

      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "table"
            ? "bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
            : "flex flex-col gap-4",
        )}
      >
        <div className={cn(viewMode === "table" ? "p-4" : "")}>
          {isLoading ? (
            viewMode === "table" ? (
              <TableSkeleton columnCount={4} rowCount={limit} showSearch={false} />
            ) : (
              <CardListSkeleton count={limit} />
            )
          ) : !data || data.data.items.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title={t(($) => $.exam.passages.table.noResult)}
              description={t(($) => $.exam.passages.description)}
            />
          ) : viewMode === "table" ? (
            <PassageTable
              data={data as ListPassagesResponse}
              isLoading={isLoading}
              paginationData={data?.data.meta as PaginationData}
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
              showToolbar={false}
            />
          ) : (
            <div className="flex flex-col gap-8">
              <div className={cn(gridClass)}>
                {(data?.data?.items || []).map((passage) => (
                  <PassageCardListItem
                    key={passage.id}
                    passage={passage}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Adaptive Pagination */}
        {!isLoading && data?.data?.items && data.data.items.length > 0 && data.data.meta && (
          <div
            className={cn(
              "transition-all duration-300",
              viewMode === "table"
                ? "px-6 pb-6 pt-2 border-t border-border/40 bg-muted/5"
                : "bg-card/60 backdrop-blur-sm p-4 rounded-2xl border border-border/50 shadow-sm",
            )}
          >
            <DataTablePagination
              paginationData={data.data.meta as PaginationData}
              pageIndex={((data.data.meta as PaginationData).page || 1) - 1}
              setPageIndex={() => { }}
              pageSize={(data.data.meta as PaginationData).limit || 10}
              setPageSize={() => { }}
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

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.exam.passages.delete.confirmTitle),
          desc: t(($) => $.exam.passages.delete.confirmDesc, {
            title: selectedPassage?.title || "No Title",
          }),
          infoContainer: t(($) => $.exam.passages.delete.deleteInfo),
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
