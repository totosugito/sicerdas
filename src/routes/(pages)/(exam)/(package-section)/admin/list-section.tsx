import { createFileRoute } from "@tanstack/react-router";
import {
  useListPackageSection,
  useDeletePackageSection,
  ExamPackageSection,
  ListSectionsResponse,
} from "@/api/exam-package-sections";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app";
import { Plus, Trash2 } from "lucide-react";
import { DialogModal } from "@/components/custom/components";
import {
  SectionTable,
  DialogSectionForm,
} from "@/components/pages/exam/package-section/section-list";
import { PaginationData } from "@/components/custom/table";
import { z } from "zod";

export const Route = createFileRoute("/(pages)/(exam)/(package-section)/admin/list-section")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
    packageId: z.string().optional().catch(undefined),
  }),
  component: AdminExamPackageSectionsPage,
});

function AdminExamPackageSectionsPage() {
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
  const packageId = searchParams.packageId;

  // API Hooks
  const { data, isLoading } = useListPackageSection({
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    packageId,
  });

  const deleteMutation = useDeletePackageSection();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<ExamPackageSection | null>(null);

  // Handlers
  const handleAdd = () => {
    setSelectedSection(null);
    setShowFormModal(true);
  };

  const handleEdit = (section: ExamPackageSection) => {
    setSelectedSection(section);
    setShowFormModal(true);
  };

  const handleDelete = (section: ExamPackageSection) => {
    setSelectedSection(section);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedSection) return;
    deleteMutation.mutate(selectedSection.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.exam.sections.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-package-sections-list"] });
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
          title={t(($) => $.exam.sections.title)}
          description={<span>{t(($) => $.exam.sections.description)}</span>}
        />
        <Button onClick={handleAdd} className="flex-shrink-0 gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
        </Button>
      </div>

      <SectionTable
        data={data as ListSectionsResponse}
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
        onEdit={handleEdit}
      />

      <DialogSectionForm
        open={showFormModal}
        onOpenChange={setShowFormModal}
        section={selectedSection}
        packageId={packageId || undefined}
      />

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.exam.sections.delete.confirmTitle),
          desc: t(($) => $.exam.sections.delete.confirmDesc, { title: selectedSection?.title }),
          infoContainer: t(($) => $.exam.sections.delete.deleteInfo),
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
