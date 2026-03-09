import { createFileRoute, Link } from '@tanstack/react-router';
import {
  useListQuestion,
  useDeleteQuestion,
  ExamQuestion,
  ListQuestionsResponse,
  EnumDifficultyLevel,
  EnumQuestionType
} from '@/api/exam-questions';
import { useQueryClient } from '@tanstack/react-query';
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useState } from 'react';
import { useAppTranslation } from '@/lib/i18n-typed';
import { Button } from '@/components/ui/button';
import { PageTitle } from '@/components/app';
import { Plus, Trash2 } from 'lucide-react';
import { DialogModal } from '@/components/custom/components';
import { QuestionTable } from '@/components/pages/exam/questions/list-question';
import { PaginationData } from '@/components/custom/table';
import { z } from 'zod';
import { AppRoute } from '@/constants/app-route';

export const Route = createFileRoute('/(pages)/(exam)/(questions)/admin/list-question')({
  validateSearch: z.object({
    page: z.number().min(1).optional().catch(undefined),
    limit: z.number().min(5).optional().catch(undefined),
    search: z.string().optional().catch(undefined),
    sortBy: z.string().optional().catch(undefined),
    sortOrder: z.enum(['asc', 'desc']).optional().catch(undefined),
    subjectId: z.string().uuid().optional().catch(undefined),
    difficulty: z.enum(Object.values(EnumDifficultyLevel) as [string, ...string[]]).optional().catch(undefined),
    type: z.enum(Object.values(EnumQuestionType) as [string, ...string[]]).optional().catch(undefined),
  }),
  component: AdminExamQuestionsPage,
});

function AdminExamQuestionsPage() {
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
  const { subjectId, difficulty, type } = searchParams;

  // API Hooks
  const { data, isLoading } = useListQuestion({
    page,
    limit,
    search,
    sortBy,
    sortOrder,
    subjectId,
    difficulty,
    type,
  });

  const deleteMutation = useDeleteQuestion();

  // Dialog & Modal States
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<ExamQuestion | null>(null);

  // Handlers
  const handleDelete = (question: ExamQuestion) => {
    setSelectedQuestion(question);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (!selectedQuestion) return;
    deleteMutation.mutate(selectedQuestion.id, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t($ => $.exam.questions.delete.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-questions-list"] });
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
          title={t($ => $.exam.questions.title)}
          description={<span>{t($ => $.exam.questions.description)}</span>}
        />
        <Button asChild className="flex-shrink-0 gap-1.5 shadow-sm">
          <Link to={AppRoute.exam.questions.admin.create.url}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">{t($ => $.labels.add)}</span>
          </Link>
        </Button>
      </div>

      <QuestionTable
        data={data as ListQuestionsResponse}
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
        setSearch={(newSearch: string) => {
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
        onSortChange={(newSortBy: string, newSortOrder: "asc" | "desc") => {
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
          title: t($ => $.exam.questions.delete.confirmTitle),
          desc: t($ => $.exam.questions.delete.confirmDesc),
          infoContainer: t($ => $.exam.questions.delete.deleteInfo),
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
