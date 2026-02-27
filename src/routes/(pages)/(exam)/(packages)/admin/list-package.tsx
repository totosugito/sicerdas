import { createFileRoute, Link } from '@tanstack/react-router';
import {
  useListPackage,
  useDeletePackage,
  ExamPackage,
  ListPackagesResponse
} from '@/api/exam/packages';
import { useQueryClient } from '@tanstack/react-query';
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/app';
import { Plus, Trash2 } from 'lucide-react';
import { DialogModal } from '@/components/custom/components';
import { PackageTable } from '@/components/pages/exam/packages/list-package';
import { PaginationData } from '@/components/custom/table';
import { z } from 'zod';
import { AppRoute } from '@/constants/app-route';

export const Route = createFileRoute('/(pages)/(exam)/(packages)/admin/list-package')({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
  }),
  component: AdminExamPackagesPage,
});

function AdminExamPackagesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = Route.useNavigate();
  const searchParams = Route.useSearch();

  // States for pagination, search, and sorting
  const page = searchParams.page ?? 1;
  const limit = searchParams.limit ?? 10;
  const search = searchParams.search ?? "";
  const sortBy = searchParams.sortBy ?? "title";
  const sortOrder = searchParams.sortOrder ?? "asc";

  // API Hooks
  const { data, isLoading } = useListPackage({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeletePackage();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
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
        showNotifSuccess({ message: res.message || t("exam.packages.list.delete.success") });
        queryClient.invalidateQueries({ queryKey: ["exam-packages-list"] });
        setShowDeleteDialog(false);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t("labels.error") });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-start">
        <PageTitle
          title={t("exam.packages.list.title")}
          description={<span>{t("exam.packages.list.description")}</span>}
        />
        <Button asChild className="flex-shrink-0 gap-1.5 shadow-sm">
          <Link to={AppRoute.exam.packages.admin.create.url}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t("labels.add")}</span>
          </Link>
        </Button>
      </div>

      <PackageTable
        data={data as ListPackagesResponse}
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
              page: 1, // Reset to page 1 on resort
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
          title: t("exam.packages.list.delete.confirmTitle"),
          desc: t("exam.packages.list.delete.confirmDesc", { title: selectedPackage?.title }),
          infoContainer: t("exam.packages.list.delete.deleteInfo"),
          infoContainerVariant: "error",
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          textCancel: t("labels.cancel"),
          textConfirm: t("labels.delete"),
          onConfirmClick: confirmDelete,
        }}
      />
    </div>
  );
}
