import React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle, ErrorContainer, LoadingView } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { useDetailQuestion } from "@/api/exam-questions";
import { QuestionDetailView } from "@/components/pages/exam/questions/detail-question";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/(pages)/exam/(questions)/admin/detail-question/$id")({
  validateSearch: z.object({
    tab: z.string().optional().catch(undefined),
  }),
  component: AdminExamQuestionsDetailPage,
});

function AdminExamQuestionsDetailPage() {
  const { t } = useAppTranslation();
  const { id } = Route.useParams();
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const currentTab = searchParams.tab || "content";

  const handleTabChange = (value: string) => {
    navigate({
      search: { ...searchParams, tab: value },
      replace: true,
    });
  };

  const { data: questionData, isLoading, isError, error, refetch } = useDetailQuestion(id);

  const question = questionData?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageTitle
          title={t(($) => $.exam.questions.detail.title)}
          description={t(($) => $.exam.questions.detail.description)}
          showBack
          backTo={AppRoute.exam.questions.admin.list.url}
        />
        <LoadingView
          title={t(($) => $.exam.questions.edit.loadingTitle)}
          message={t(($) => $.exam.questions.edit.loading)}
        />
      </div>
    );
  }

  if (isError || !question) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageTitle
          title={t(($) => $.exam.questions.detail.title)}
          description={t(($) => $.exam.questions.detail.description)}
          showBack
          backTo={AppRoute.exam.questions.admin.list.url}
        />
        <ErrorContainer
          title={t(($) => $.exam.questions.edit.notFound.title)}
          message={error?.message || t(($) => $.exam.questions.edit.notFound.message)}
          buttonText={t(($) => $.exam.questions.edit.notFound.retryButton)}
          onButtonClick={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      <PageTitle
        title={t(($) => $.exam.questions.detail.title)}
        description={t(($) => $.exam.questions.detail.description)}
        showBack
        backTo={AppRoute.exam.questions.admin.list.url}
        extra={
          <Link to={AppRoute.exam.questions.admin.edit.url} params={{ id: question.id }}>
            <Button className="gap-2">
              <Edit className="h-4 w-4" />
              {t(($) => $.exam.questions.detail.editButton)}
            </Button>
          </Link>
        }
      />

      <QuestionDetailView
        question={question}
        currentTab={currentTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
