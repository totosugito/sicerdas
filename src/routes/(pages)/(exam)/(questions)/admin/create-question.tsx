import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/app";
import { useCreateQuestion } from "@/api/exam-questions";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useQueryClient } from "@tanstack/react-query";
import { AppRoute } from "@/constants/app-route";
import { QuestionForm } from "@/components/pages/exam/questions/create-question/QuestionForm";
import { QuestionFormValues } from "@/api/exam-questions/types";

export const Route = createFileRoute("/(pages)/(exam)/(questions)/admin/create-question")({
  component: AdminExamQuestionsCreatePage,
});

function AdminExamQuestionsCreatePage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreateQuestion();

  const onSubmit = async (values: QuestionFormValues | FormData) => {
    let finalSubmission: FormData;

    if (values instanceof FormData) {
      finalSubmission = values;
    } else {
      const transformedData = {
        ...values,
        educationGradeId: values.educationGradeId ? Number(values.educationGradeId) : undefined,
        requiredTier: values.requiredTier || undefined,
        passageId: values.passageId || undefined,
      };

      finalSubmission = new FormData();
      finalSubmission.append("data", JSON.stringify(transformedData));
    }

    createMutation.mutate(finalSubmission, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.exam.questions.create.success) });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-questions-list"] });
        navigate({ to: AppRoute.exam.questions.admin.edit.url.replace("$id", res.data.id) });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t(($) => $.exam.questions.create.title)}
          description={<span>{t(($) => $.exam.questions.create.description)}</span>}
          showBack
          backTo={AppRoute.exam.questions.admin.list.url}
        />
      </div>

      <QuestionForm onSubmit={onSubmit} isPending={createMutation.isPending} />
    </div>
  );
}
