import React, { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PageTitle, ErrorContainer } from '@/components/app';
import { PackageDetailSkeleton } from '@/components/pages/exam/packages/detail-package';
import { useUpdatePackage, useDetailPackage } from '@/api/exam/packages';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';
import { useQueryClient } from '@tanstack/react-query';
import { AppRoute } from '@/constants/app-route';
import { PackageForm, PackageFormValues } from '@/components/pages/exam/packages/create-package';

export const Route = createFileRoute('/(pages)/(exam)/(packages)/admin/edit-package/$id')({
  component: AdminExamPackagesEditPage,
});

function AdminExamPackagesEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const updateMutation = useUpdatePackage();
  const { data: detailData, isLoading, isError, error } = useDetailPackage({ id });

  const onSubmit = async (values: PackageFormValues) => {
    const payload = {
      id,
      ...values,
      educationGradeId: values.educationGradeId ? Number(values.educationGradeId) : undefined,
      requiredTier: values.requiredTier || undefined,
      description: values.description || undefined,
    };

    updateMutation.mutate(payload, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t("exam.packages.list.notifications.updateSuccess") });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t("labels.error") });
      }
    });
  };

  if (isLoading && !isError) {
    return <PackageDetailSkeleton />;
  }

  if (isError || (!isLoading && !detailData?.data)) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-4">
          <PageTitle
            title={t("exam.packages.list.edit.title")}
            description={<span>{t("exam.packages.list.edit.description")}</span>}
            showBack
            backTo={AppRoute.exam.packages.admin.list.url}
          />
        </div>

        <ErrorContainer
          title={t("labels.error")}
          message={error?.message}
          buttonText={t("exam.packages.list.backToPage")}
          onButtonClick={() => navigate({ to: AppRoute.exam.packages.admin.list.url, replace: true })}
        />
      </div>
    );
  }

  const packageData = detailData?.data;

  const initialData: Partial<PackageFormValues> = {
    title: packageData?.title,
    categoryId: packageData?.categoryId,
    examType: packageData?.examType,
    durationMinutes: packageData?.durationMinutes,
    educationGradeId: packageData?.educationGradeId ? String(packageData.educationGradeId) : "",
    requiredTier: packageData?.requiredTier || "free",
    description: packageData?.description || "",
    isActive: packageData?.isActive,
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t("exam.packages.list.edit.title")}
          description={<span>{t("exam.packages.list.edit.description")}</span>}
          showBack
          backTo={AppRoute.exam.packages.admin.list.url}
        />
      </div>

      <PackageForm
        defaultValues={initialData}
        onSubmit={onSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
