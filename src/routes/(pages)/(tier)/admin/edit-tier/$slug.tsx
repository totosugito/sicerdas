import React, { useMemo } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle, ErrorContainer } from "@/components/app";
import { AppRoute } from "@/constants/app-route";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useDetailsTier } from "@/api/tier/admin/details-tier";
import { useUpdateTier } from "@/api/tier/admin/update-tier";
import { CreateTierRequest } from "@/api/tier/admin/create-tier";
import { CreateTierForm } from "@/components/pages/tier/create-tier";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/(pages)/(tier)/admin/edit-tier/$slug")({
  component: EditTierPage,
});

function EditTierPage() {
  const { slug } = Route.useParams();
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useDetailsTier(slug);
  const updateMutation = useUpdateTier();

  const initialValues: Partial<CreateTierRequest> = useMemo(() => {
    if (!data?.data) return {};
    return {
      slug: data.data.slug,
      name: data.data.name,
      price: data.data.price,
      currency: data.data.currency,
      billingCycle: data.data.billingCycle,
      features: data.data.features,
      limits: data.data.limits,
      isActive: data.data.isActive,
      sortOrder: data.data.sortOrder,
      isPopular: data.data.isPopular,
    };
  }, [data?.data]);

  const onSubmit = async (values: CreateTierRequest) => {
    updateMutation.mutate({ ...values, slug }, {
      onSuccess: (res) => {
        showNotifSuccess({
          message: res.message || t(($) => $.tier.edit.messages.success),
        });
        queryClient.invalidateQueries({ queryKey: ["admin-app-tier-details", slug] });
        navigate({ to: AppRoute.app.tier.admin.list.url });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full p-6">
        <Skeleton className="h-10 w-1/4" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorContainer
        title={t(($) => $.tier.edit.messages.error)}
        message={error?.message || t(($) => $.tier.edit.messages.error)}
        buttonText={t(($) => $.labels.back)}
        onButtonClick={() => navigate({ to: AppRoute.app.tier.admin.list.url })}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <PageTitle
        title={t(($) => $.tier.edit.title)}
        description={t(($) => $.tier.edit.description)}
        showBack
        backTo={AppRoute.app.tier.admin.list.url}
      />

      <CreateTierForm
        defaultValues={initialValues}
        onSubmit={onSubmit}
        isLoading={updateMutation.isPending}
        onCancel={() => navigate({ to: AppRoute.app.tier.admin.list.url })}
      />
    </div>
  );
}
