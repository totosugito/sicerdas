import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle } from "@/components/app";
import { CreateTierForm } from "@/components/pages/tier/create-tier";
import { useCreateTier, CreateTierParams } from "@/api/tier";
import { showNotifSuccess } from "@/lib/show-notif";
import { AppRoute } from "@/constants/app-route";

export const Route = createFileRoute("/(pages)/(tier)/admin/create-tier")({
  component: CreateTierPage,
});

function CreateTierPage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreateTier();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (data: CreateTierParams) => {
    setError(null);
    createMutation.mutate(data, {
      onSuccess: (response) => {
        showNotifSuccess({
          message: response.message || t(($) => $.tier.create.messages.success),
        });
        queryClient.invalidateQueries({ queryKey: ["admin-app-tier-list"] });
        navigate({ to: AppRoute.app.tier.admin.list.url });
      },
      onError: (error: any) => {
        setError(error.message || t(($) => $.tier.create.messages.error));
      },
    });
  };

  const handleCancel = () => {
    navigate({ to: AppRoute.app.tier.admin.list.url });
  };

  return (
    <div className="flex flex-col w-full space-y-6">
      <PageTitle
        title={t(($) => $.tier.create.pageTitle)}
        description={<span>{t(($) => $.tier.create.description)}</span>}
        showBack
        backTo={AppRoute.app.tier.admin.list.url}
      />

      <CreateTierForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={createMutation.isPending}
        error={error}
      />
    </div>
  );
}
