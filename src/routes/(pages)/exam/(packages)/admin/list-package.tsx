import { createFileRoute, Link } from "@tanstack/react-router";
import {
  useListPackage,
  useDeletePackage,
  useClonePackage,
  ExamPackage,
  ListPackagesResponse,
} from "@/api/exam/packages";
import { EnumExamType } from "@/api/exam/types";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useEffect, useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/general";
import { DialogModal } from "@/components/dialog";
import { useAppStore } from "@/stores/useAppStore";
import {
  PackageTable,
  PackageCardList,
  PackageToolbar,
} from "@/features/exam/packages/list-package";
import { Plus, Trash2, Copy } from "lucide-react";

import { PaginationData, DataTablePagination } from "@/components/table";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/(pages)/exam/(packages)/admin/list-package")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    examTypes: z.array(z.string()).optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
    view: z.enum(["table", "card"]).optional().catch(undefined),
  }),
  component: AdminExamPackagesPage,
});

function AdminExamPackagesPage() {
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  // States for pagination, search, and sorting
  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const examTypes = searchParams.examTypes ?? [EnumExamType.OFFICIAL];
  const sortBy = searchParams.sortBy ?? "updatedAt";
  const sortOrder = searchParams.sortOrder ?? "desc";
  const viewMode = searchParams.view ?? "card";

  const { examPackages, setExamPackages } = useAppStore();
  const [searchTerm, setSearchTerm] = useState(search);

  // Sync with store on mount - if view is missing, use store value
  useEffect(() => {
    if (!searchParams.view) {
      navigate({
        search: { ...searchParams, view: examPackages.viewMode },
        replace: true,
      });
    }
  }, []);

  // Sync store with current URL params
  useEffect(() => {
    setExamPackages({
      viewMode,
      limit: searchParams.limit ?? 10,
      sortBy: sortBy,
      sortOrder: sortOrder,
      search: searchParams.search ?? "",
    });
  }, [viewMode, searchParams.limit, sortBy, sortOrder, searchParams.search]);

  // API Hooks
  const { data, isLoading } = useListPackage({
    page,
    limit,
    search,
    examType: examTypes,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeletePackage();
  const cloneMutation = useClonePackage();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCloneDialog, setShowCloneDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<ExamPackage | null>(null);

  // Handlers
  const handleDelete = (pkg: ExamPackage) => {
    setSelectedPackage(pkg);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedPackage) return;
    deleteMutation.mutate(selectedPackage.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.exam.packages.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-packages-list"] });
        setShowDeleteDialog(false);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  const handleClone = (pkg: ExamPackage) => {
    setSelectedPackage(pkg);
    setShowCloneDialog(true);
  };

  const confirmClone = () => {
    if (!selectedPackage) return;
    cloneMutation.mutate(
      {
        sourcePackageId: selectedPackage.id,
        title: `${selectedPackage.title} (Cloned)`,
        examType: EnumExamType.COURSE_EXAM,
      },
      {
        onSuccess: (res) => {
          showNotifSuccess({ message: res.message || t(($) => $.exam.packages.clone.success) });
          queryClient.invalidateQueries({ queryKey: ["admin-exam-packages-list"] });
          setShowCloneDialog(false);
        },
        onError: (err: any) => {
          showNotifError({ message: err.message || t(($) => $.exam.packages.clone.error) });
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-start">
        <PageTitle
          title={t(($) => $.exam.packages.title)}
          description={<span>{t(($) => $.exam.packages.description)}</span>}
        />
        <Button render={<Link to={AppRoute.exam.packages.admin.create.url} />} nativeButton={false} className="flex-shrink-0 gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
        </Button>
      </div>

      <PackageToolbar
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
        examTypes={examTypes}
        onExamTypesChange={(newTypes) => {
          navigate({
            search: {
              ...searchParams,
              examTypes: newTypes,
              page: 1,
            },
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
      />

      <div
        className={cn(
          "transition-all duration-300",
          viewMode === "table"
            ? "bg-card rounded-2xl border border-border shadow-sm"
            : "flex flex-col gap-4",
        )}
      >
        <div className={cn(viewMode === "table" ? "p-4" : "")}>
          {viewMode === "table" ? (
            <PackageTable
              data={data as ListPackagesResponse}
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
              onClone={handleClone}
              showPagination={false}
            />
          ) : (
            <PackageCardList
              data={data as ListPackagesResponse}
              isLoading={isLoading}
              paginationData={data?.data.meta as PaginationData}
              onDelete={handleDelete}
              onClone={handleClone}
            />
          )}
        </div>

        {/* Adaptive Pagination (Merged Tray for Table / Floating Dock for Card) */}
        {!isLoading && data?.data.meta && (
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
          title: t(($) => $.exam.packages.delete.confirmTitle),
          desc: t(($) => $.exam.packages.delete.confirmDesc, { title: selectedPackage?.title }),
          infoContainer: t(($) => $.exam.packages.delete.deleteInfo),
          infoContainerVariant: "error",
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          textCancel: t(($) => $.labels.cancel),
          textConfirm: t(($) => $.labels.delete),
          onConfirmClick: confirmDelete,
        }}
      />

      <DialogModal
        open={showCloneDialog}
        onOpenChange={setShowCloneDialog}
        modal={{
          title: t(($) => $.exam.packages.clone.confirmTitle),
          desc: t(($) => $.exam.packages.clone.confirmDesc, { title: selectedPackage?.title }),
          variant: "default",
          iconType: "info",
          headerIcon: <Copy className="h-5 w-5 text-primary" />,
          textCancel: t(($) => $.labels.cancel),
          textConfirm: t(($) => $.exam.packages.table.actions.clone),
          onConfirmClick: confirmClone,
        }}
      />
    </div>
  );
}
