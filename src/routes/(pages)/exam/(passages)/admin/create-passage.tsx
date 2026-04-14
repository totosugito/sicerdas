import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/app";
import { useCreatePassage } from "@/api/exam-passages";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useQueryClient } from "@tanstack/react-query";
import { AppRoute } from "@/constants/app-route";
import { PassageForm } from "@/components/pages/exam/passages/create-passage/PassageForm";
import { PassageFormValues } from "@/api/exam-passages/types";

export const Route = createFileRoute("/(pages)/exam/(passages)/admin/create-passage")({
  component: AdminExamPassagesCreatePage,
});

function AdminExamPassagesCreatePage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreatePassage();

  const onSubmit = async (values: FormData) => {
    createMutation.mutate(values, {
      onSuccess: (res) => {
        showNotifSuccess({
          message: res.message || t(($) => $.exam.passages.notifications.createSuccess),
        });
        navigate({ to: AppRoute.exam.passages.admin.list.url });
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
          title={t(($) => $.exam.passages.create.title)}
          description={<span>{t(($) => $.exam.passages.create.description)}</span>}
          showBack
          backTo={AppRoute.exam.passages.admin.list.url}
        />
      </div>

      <PassageForm onSubmit={onSubmit} isPending={createMutation.isPending} />
    </div>
  );
}
