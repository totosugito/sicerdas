import React, { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle, ErrorContainer } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useGetVersion, useUpdateVersion, CreateVersionRequest } from "@/api/version";
import { VersionForm } from "@/components/pages/version/create-version/VersionForm";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/(pages)/(version)/admin/edit-version/$id")({
  component: EditVersionPage,
});

function EditVersionPage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useGetVersion(id);
  const updateMutation = useUpdateVersion(id);

  const initialValues: Partial<CreateVersionRequest> = useMemo(() => {
    if (!data?.data) return {};
    return {
      appVersion: data.data.appVersion,
      dbVersion: data.data.dbVersion,
      dataType: data.data.dataType,
      status: data.data.status,
      name: data.data.name,
      note: data.data.note,
      extra: data.data.extra,
    };
  }, [data?.data]);

  const onSubmit = async (values: CreateVersionRequest) => {
    updateMutation.mutate(values, {
      onSuccess: (res) => {
        showNotifSuccess({
          message: res.message || t(($) => $.version.notifications.updateSuccess),
        });
        queryClient.invalidateQueries({ queryKey: ["version-detail", id] });
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
        title={t(($) => $.version.delete.error)}
        message={error?.message || t(($) => $.version.delete.error)}
        buttonText={t(($) => $.version.backToPage)}
        onButtonClick={() => navigate({ to: AppRoute.app.version.admin.list.url })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t(($) => $.version.edit.title)}
          description={<span>{t(($) => $.version.edit.description)}</span>}
          showBack
          backTo={AppRoute.app.version.admin.list.url}
        />
      </div>

      <VersionForm
        defaultValues={initialValues}
        onSubmit={onSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
