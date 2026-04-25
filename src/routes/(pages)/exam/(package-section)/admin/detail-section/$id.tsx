import { createFileRoute, Link } from "@tanstack/react-router";
import { useDetailPackageSection } from "@/api/exam-package-sections";
import {
  useListPackageQuestions,
  useAssignPackageQuestions,
  useUnassignPackageQuestions,
  useSyncPackageQuestionsOrder,
} from "@/api/exam-package-questions";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle, LoadingView, ErrorContainer } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { ListChecks, Plus } from "lucide-react";
import {
  SectionQuestionTable,
  SectionInfoCard,
  AddQuestionModal,
} from "@/components/pages/exam/package-section/detail-section";
import { useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";

export const Route = createFileRoute("/(pages)/exam/(package-section)/admin/detail-section/$id")({
  component: AdminPackageSectionDetailPage,
});

function AdminPackageSectionDetailPage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();

  // 1. Fetch Section Detail
  const {
    data: sectionData,
    isLoading: isLoadingSection,
    isError: isErrorSection,
    error: errorSection,
    refetch: refetchSection,
  } = useDetailPackageSection(id);

  const section = sectionData?.data;

  // 2. Fetch Questions in this section
  const {
    data: questionData,
    isLoading: isLoadingQuestions,
    isError: isErrorQuestions,
    refetch: refetchQuestions,
  } = useListPackageQuestions({
    packageId: section?.packageId || "",
    sectionId: id,
    page: pagination.page,
    limit: pagination.limit,
  });

  // 3. Mutations
  const { mutate: assignQuestions, isPending: isAssigning } = useAssignPackageQuestions();
  const { mutate: unassignQuestion } = useUnassignPackageQuestions();
  const { mutate: syncOrder } = useSyncPackageQuestionsOrder();

  // 4. Handlers
  const handleAssign = (questionIds: string[]) => {
    if (!section) return;
    assignQuestions(
      {
        packageId: section.packageId,
        sectionId: id,
        questionIds,
      },
      {
        onSuccess: (res) => {
          const assigned = res.data?.totalAssigned ?? 0;
          const skipped = res.data?.totalSkipped ?? 0;

          const title = t(($) => $.exam.packageQuestions.assign.success);
          const details = t(($) => $.exam.packageQuestions.assign.details, { assigned, skipped });

          showNotifSuccess({ message: `${title} ${details}` });
          setIsModalOpen(false);
          refetchQuestions();
          queryClient.invalidateQueries({ queryKey: ["admin-exam-questions-list-simple"] });
        },
        onError: (err: any) => {
          showNotifError({
            message: err.message || t(($) => $.exam.packageQuestions.detail.errors.assign),
          });
        },
      },
    );
  };

  const handleRemove = (questionId: string) => {
    if (!section) return;
    unassignQuestion(
      {
        packageId: section.packageId,
        questionIds: [questionId],
      },
      {
        onSuccess: () => {
          showNotifSuccess({ message: t(($) => $.exam.packageQuestions.unassign.success) });
          refetchQuestions();
          queryClient.invalidateQueries({ queryKey: ["admin-exam-questions-list-simple"] });
        },
        onError: (err: any) => {
          showNotifError({
            message: err.message || t(($) => $.exam.packageQuestions.detail.errors.unassign),
          });
        },
      },
    );
  };

  const handleReorder = (updates: { questionId: string; order: number }[]) => {
    if (!section) return;
    syncOrder(
      {
        packageId: section.packageId,
        sectionId: id,
        updates,
      },
      {
        onSuccess: () => {
          // No toast for reorder to keep it smooth
          refetchQuestions();
        },
        onError: (err: any) => {
          showNotifError({
            message: err.message || t(($) => $.exam.packageQuestions.detail.errors.reorder),
          });
          refetchQuestions(); // Revert UI by refetching
        },
      },
    );
  };

  // 5. Map question items for the table
  const questions = useMemo(() => {
    return (questionData?.data.items || []).map((item) => ({
      id: item.question.id,
      content: item.question.content,
      type: item.question.type,
      difficulty: item.question.difficulty,
      subjectName: item.question.subjectName,
      order: item.order,
    }));
  }, [questionData]);

  if (isLoadingSection) {
    return <LoadingView />;
  }

  if (isErrorSection || !section) {
    return (
      <ErrorContainer
        title={t(($) => $.exam.sections.notFound.title)}
        message={errorSection?.message || t(($) => $.exam.sections.notFound.message)}
        onButtonClick={() => refetchSection()}
      />
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full pb-10">
      <PageTitle
        title={t(($) => $.exam.sections.detail.title, { title: section.title })}
        description={t(($) => $.exam.sections.detail.description)}
        showBack
        backTo={AppRoute.exam.packageSections.admin.list.url}
      />

      {/* Info Card Row */}
      <SectionInfoCard section={section} />

      {/* Questions List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex flex-col">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ListChecks className="h-6 w-6 text-primary" />
              {t(($) => $.exam.sections.table.columns.questions)}
            </h3>
            <p className="text-sm text-muted-foreground">
              {t(($) => $.exam.packageQuestions.detail.subtitle)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* <Badge variant="outline" className="px-3 py-1 font-bold text-primary border-primary/20 bg-primary/5">
              {t($ => $.exam.packageQuestions.detail.totalCount, { count: questionData?.data.meta.total || 0 })}
            </Badge> */}
            <Button variant="outline" asChild size="sm" className="gap-2">
              <Link to={AppRoute.exam.questions.admin.create.url}>
                <Plus className="h-4 w-4" />
                {t(($) => $.exam.packageQuestions.detail.createButton)}
              </Link>
            </Button>
            <Button onClick={() => setIsModalOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              {t(($) => $.exam.packageQuestions.detail.addButton)}
            </Button>
          </div>
        </div>

        {isErrorQuestions ? (
          <ErrorContainer
            title={t(($) => $.exam.packageQuestions.detail.errors.load.title)}
            message={t(($) => $.exam.packageQuestions.detail.errors.load.message)}
            buttonText={t(($) => $.exam.packageQuestions.detail.errors.load.retry)}
            onButtonClick={() => refetchQuestions()}
          />
        ) : (
          <SectionQuestionTable
            questions={questions}
            meta={questionData?.data.meta}
            onPaginationChange={setPagination}
            onReorder={handleReorder}
            onRemove={handleRemove}
            isLoading={isLoadingQuestions || isLoadingSection}
          />
        )}
      </div>

      <AddQuestionModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onConfirm={handleAssign}
        isAssigning={isAssigning}
        packageId={section.packageId}
      />
    </div>
  );
}
