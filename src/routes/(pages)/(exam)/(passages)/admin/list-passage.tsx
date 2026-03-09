import { createFileRoute, Link } from '@tanstack/react-router';
import {
  useListPassage,
  useDeletePassage,
  ExamPassage,
  ListPassagesResponse
} from '@/api/exam-passages';
import { useQueryClient } from '@tanstack/react-query';
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from 'react';
import { useAppTranslation } from '@/lib/i18n-typed';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/app';
import { Plus, Trash2 } from 'lucide-react';
import { DialogModal } from '@/components/custom/components';
import { PassageTable } from '@/components/pages/exam/passages';
import { PaginationData } from '@/components/custom/table';
import { z } from 'zod';
import { AppRoute } from '@/constants/app-route';

export const Route = createFileRoute('/(pages)/(exam)/(passages)/admin/list-passage')({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
    subjectId: z.string().uuid().optional().catch(undefined),
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
  const subjectId = searchParams.subjectId;

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
        showNotifSuccess({ message: res.message || t($ => $.exam.passages.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-passages-list"] });
        setShowDeleteDialog(false);
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t($ => $.labels.error) });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex justify-between items-start">
        <PageTitle
          title={t($ => $.exam.passages.title)}
          description={<span>{t($ => $.exam.passages.description)}</span>}
        />
        <Button asChild className="flex-shrink-0 gap-1.5 shadow-sm">
          <Link to={AppRoute.exam.passages.admin.create.url}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t($ => $.labels.add)}</span>
          </Link>
        </Button>
      </div>

      <PassageTable
        data={data as ListPassagesResponse}
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
          title: t($ => $.exam.passages.delete.confirmTitle),
          desc: t($ => $.exam.passages.delete.confirmDesc, { title: selectedPassage?.title || "No Title" }),
          infoContainer: t($ => $.exam.passages.delete.deleteInfo),
          infoContainerVariant: "error",
          variant: "destructive",
          iconType: "error",
          headerIcon: <Trash2 className="h-5 w-5 text-destructive" />,
          textCancel: t($ => $.labels.cancel),
          textConfirm: t($ => $.labels.delete),
          onConfirmClick: confirmDelete,
        }}
      />
    </div>
  );
}
