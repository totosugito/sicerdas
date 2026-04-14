import { createFileRoute } from "@tanstack/react-router";
import {
  useListSubject,
  useDeleteSubject,
  ExamSubject,
  ListSubjectResponse,
} from "@/api/exam-subjects";
import { useQueryClient } from "@tanstack/react-query";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { Button } from "@/components/ui/button";
import { PageTitle } from "@/components/app";
import { Plus, Trash2 } from "lucide-react";
import { DialogModal } from "@/components/custom/components";
import { SubjectTable, DialogSubjectCreate } from "@/components/pages/exam/subjects";
import { PaginationData } from "@/components/custom/table";
import { z } from "zod";

export const Route = createFileRoute("/(pages)/exam/(subjects)/admin/list-subject")({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(["asc", "desc"]).optional().catch(undefined),
  }),
  component: AdminExamSubjectsPage,
});

function AdminExamSubjectsPage() {
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

  // API Hooks
  const { data, isLoading } = useListSubject({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteSubject();

  // Dialog & Modal States
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<ExamSubject | null>(null);

  // Handlers
  const handleAdd = () => {
    setSelectedSubject(null);
    setShowDialog(true);
  };

  const handleEdit = (subject: ExamSubject) => {
    setSelectedSubject(subject);
    setShowDialog(true);
  };

  const handleDelete = (subject: ExamSubject) => {
    setSelectedSubject(subject);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedSubject) return;
    deleteMutation.mutate(selectedSubject.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.exam.subjects.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["exam-subjects-list"] });
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
          title={t(($) => $.exam.subjects.title)}
          description={<span>{t(($) => $.exam.subjects.description)}</span>}
        />
        <Button onClick={handleAdd} className="flex-shrink-0 gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">{t(($) => $.labels.add)}</span>
        </Button>
      </div>

      <SubjectTable
        data={data as ListSubjectResponse}
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
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DialogSubjectCreate
        open={showDialog}
        onOpenChange={setShowDialog}
        subject={selectedSubject}
      />

      <DialogModal
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        modal={{
          title: t(($) => $.exam.subjects.delete.confirmTitle),
          desc: t(($) => $.exam.subjects.delete.confirmDesc, { name: selectedSubject?.name }),
          infoContainer: t(($) => $.exam.subjects.delete.deleteInfo),
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
