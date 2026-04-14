import React, { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle, ErrorContainer } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useGetPassage, useUpdatePassage, PassageFormValues } from "@/api/exam-passages";
import { PassageForm } from "@/components/pages/exam/passages/create-passage/PassageForm";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/(pages)/exam/(passages)/admin/edit-passage/$id")({
  component: EditPassagePage,
});

function EditPassagePage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetPassage(id);
  const updateMutation = useUpdatePassage(id);

  const initialValues: Partial<PassageFormValues> = useMemo(() => {
    if (!data?.data) return {};
    return {
      title: data.data.title || "",
      subjectId: data.data.subjectId,
      content: data.data.content,
      isActive: data.data.isActive,
    };
  }, [data?.data]);

  const onSubmit = async (values: FormData) => {
    updateMutation.mutate(values, {
      onSuccess: (res) => {
        showNotifSuccess({
          message: res.message || t(($) => $.exam.passages.notifications.updateSuccess),
        });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-passages-detail", id] });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorContainer
        title={t(($) => $.exam.passages.delete.error)}
        message={error?.message || t(($) => $.exam.passages.delete.error)}
        buttonText={t(($) => $.exam.passages.backToPage)}
        onButtonClick={() => navigate({ to: AppRoute.exam.passages.admin.list.url })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t(($) => $.exam.passages.edit.title)}
          description={<span>{t(($) => $.exam.passages.edit.description)}</span>}
          showBack
          backTo={AppRoute.exam.passages.admin.list.url}
        />
      </div>

      <PassageForm
        defaultValues={initialValues}
        onSubmit={onSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
