import React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { z } from "zod";
import { PageTitle, ErrorContainer, LoadingView } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ListChecks, Lightbulb, Tag as TagIcon, FileText } from "lucide-react";
import { useDetailQuestion, useUpdateQuestion } from "@/api/exam-questions";
import {
  QuestionSettingsTab,
  QuestionContentTab,
  QuestionOptionsTab,
  QuestionSolutionsTab,
  QuestionTagsTab,
} from "@/components/pages/exam/questions/edit-question";
import { type UpdateQuestionRequest } from "@/api/exam-questions/admin/update-question";
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";

export const Route = createFileRoute("/(pages)/(exam)/(questions)/admin/edit-question/$id")({
  validateSearch: z.object({
    tab: z.string().optional().catch(undefined),
  }),
  component: AdminExamQuestionsEditPage,
});

function AdminExamQuestionsEditPage() {
  const { t } = useAppTranslation();
  const { id } = Route.useParams();

  const { data: questionData, isLoading, isError, error, refetch } = useDetailQuestion(id);
  const updateMutation = useUpdateQuestion(id);
  const searchParams = Route.useSearch();
  const navigate = Route.useNavigate();

  const currentTab = searchParams.tab || "settings";

  const handleTabChange = (value: string) => {
    navigate({
      search: { ...searchParams, tab: value },
      replace: true,
    });
  };

  const question = questionData?.data;

  const initialData = useMemo(() => {
    return {
      subjectId: question?.subjectId || "",
      passageId: question?.passageId || null,
      difficulty: question?.difficulty,
      type: question?.type,
      requiredTier: question?.requiredTier || "free",
      educationGradeId: question?.educationGradeId ? String(question.educationGradeId) : "",
      isActive: question?.isActive ?? true,
      content: question?.content || [],
      reasonContent: question?.reasonContent || [],
    };
  }, [question]);

  const handleUpdate = async (values: UpdateQuestionRequest | FormData) => {
    try {
      let submissionData: UpdateQuestionRequest | FormData = values;

      // Only transform if it's a plain object (not FormData)
      if (!(values instanceof FormData)) {
        submissionData = {
          ...values,
          educationGradeId:
            values.educationGradeId === undefined
              ? undefined
              : values.educationGradeId === null || (values.educationGradeId as any) === ""
                ? null
                : Number(values.educationGradeId),
          requiredTier: values.requiredTier || undefined,
          passageId:
            values.passageId === undefined
              ? undefined
              : values.passageId === "" || values.passageId === "null" || values.passageId === null
                ? null
                : values.passageId,
        };
      }

      await updateMutation.mutateAsync(submissionData);
      showNotifSuccess({ message: t(($) => $.exam.questions.edit.success) });
      refetch();
    } catch (error: any) {
      showNotifError({
        message: error?.response?.data?.message || error?.message,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <PageTitle
          title={t(($) => $.exam.questions.edit.title)}
          description={t(($) => $.exam.questions.edit.description)}
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
          title={t(($) => $.exam.questions.edit.title)}
          description={t(($) => $.exam.questions.edit.description)}
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
    <div className="flex flex-col gap-6 w-full pb-20">
      <PageTitle
        title={t(($) => $.exam.questions.edit.title)}
        description={t(($) => $.exam.questions.edit.description)}
        showBack
        backTo={AppRoute.exam.questions.admin.list.url}
      />

      <Tabs value={currentTab} onValueChange={handleTabChange} className="w-full gap-0">
        <TabsList className="grid w-full grid-cols-5 lg:w-[750px] mb-4">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t(($) => $.exam.questions.edit.tabs.settings)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">{t(($) => $.exam.questions.edit.tabs.content)}</span>
          </TabsTrigger>
          <TabsTrigger value="options" className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <span className="hidden sm:inline">{t(($) => $.exam.questions.edit.tabs.options)}</span>
          </TabsTrigger>
          <TabsTrigger value="solutions" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">
              {t(($) => $.exam.questions.edit.tabs.solutions)}
            </span>
          </TabsTrigger>
          <TabsTrigger value="tags" className="flex items-center gap-2">
            <TagIcon className="h-4 w-4" />
            <span className="hidden sm:inline">{t(($) => $.exam.questions.edit.tabs.tags)}</span>
          </TabsTrigger>
        </TabsList>

        {/* Settings Tab */}
        <TabsContent value="settings" className="mt-0">
          <QuestionSettingsTab
            defaultValues={initialData}
            onSubmit={handleUpdate}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="mt-0">
          <QuestionContentTab
            defaultValues={initialData}
            onSubmit={(values) => handleUpdate(values)}
            isPending={updateMutation.isPending}
          />
        </TabsContent>

        {/* Options Tab */}
        <TabsContent value="options" className="mt-0">
          <QuestionOptionsTab questionId={id} options={question.options} />
        </TabsContent>

        {/* Solutions Tab */}
        <TabsContent value="solutions" className="mt-0">
          <QuestionSolutionsTab questionId={id} solutions={question.solutions} />
        </TabsContent>

        {/* Tags Tab */}
        <TabsContent value="tags" className="mt-0">
          <QuestionTagsTab questionId={id} tags={question.tags} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
