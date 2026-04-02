import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/app";
import { useCreateVersion } from "@/api/version";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useQueryClient } from "@tanstack/react-query";
import { AppRoute } from "@/constants/app-route";
import { VersionForm } from "@/components/pages/version/create-version/VersionForm";
import { CreateVersionRequest } from "@/api/version/types";

export const Route = createFileRoute("/(pages)/(version)/admin/create-version")({
  component: AdminVersionsCreatePage,
});

function AdminVersionsCreatePage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreateVersion();

  const onSubmit = async (values: CreateVersionRequest) => {
    createMutation.mutate(values, {
      onSuccess: (res) => {
        showNotifSuccess({
          message:
            res.message || t(($) => $.version.notifications?.createSuccess || $.labels.success),
        });
        queryClient.invalidateQueries({ queryKey: ["version-list"] });
        navigate({ to: AppRoute.admin.version.list.url });
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
          title={t(($) => $.labels.add) + " " + t(($) => $.version.title)}
          description={<span>{t(($) => $.version.form.name.placeholder)}</span>}
          showBack
          backTo={AppRoute.admin.version.list.url}
        />
      </div>

      <VersionForm onSubmit={onSubmit} isPending={createMutation.isPending} />
    </div>
  );
}
