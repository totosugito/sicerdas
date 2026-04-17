import { createFileRoute, Link } from "@tanstack/react-router";
import { useListVersion, useDeleteVersion, AppVersion, ListVersionResponse } from "@/api/version";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app";
import { Plus, Trash2 } from "lucide-react";
import { DialogModal } from "@/components/custom/components";
import { VersionTable } from "@/components/pages/version/list-version/VersionTable";
import { PaginationData } from "@/components/custom/table";
import { z } from "zod";
import { AppRoute } from "@/constants/app-route";

export const Route = createFileRoute("/(pages)/(version)/admin/versions")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
    dataType: z.string().optional().catch(undefined),
  }),
  component: AdminVersionsPage,
});

function AdminVersionsPage() {
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
  const dataType = searchParams.dataType;

  // API Hooks
  const { data, isLoading } = useListVersion({
    page,
    limit,
    search,
    sortBy,
    sortOrder: sortOrder as "asc" | "desc",
    dataType,
  });

  const deleteMutation = useDeleteVersion();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<AppVersion | null>(null);

  // Handlers
  const handleDelete = (version: AppVersion) => {
    setSelectedVersion(version);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedVersion) return;
    deleteMutation.mutate(selectedVersion.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.version.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["version-list"] });
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
          title={t(($) => $.version.title)}
          description={<span>{t(($) => $.version.menu)}</span>}
        />
        <Button asChild className="flex-shrink-0 gap-1.5 shadow-sm">
          <Link to={AppRoute.app.version.admin.create.url}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
          </Link>
        </Button>
      </div>

      <VersionTable
        data={data as ListVersionResponse}
        isLoading={isLoading}
        paginationData={data?.data.meta as PaginationData}
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
      />

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.version.delete.confirmTitle),
          desc: t(($) => $.version.delete.confirmDesc, {
            title: selectedVersion?.name || "No Name",
          }),
          infoContainer: t(($) => $.version.delete.deleteInfo),
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
