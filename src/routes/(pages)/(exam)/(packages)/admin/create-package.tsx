import React from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { PageTitle } from '@/components/app';
import { useCreatePackage } from '@/api/exam/packages';
import { showNotifSuccess, showNotifError } from '@/lib/show-notif';
import { useQueryClient } from '@tanstack/react-query';
import { AppRoute } from '@/constants/app-route';
import { PackageForm, PackageFormValues } from '@/components/pages/exam/packages/create-package';

export const Route = createFileRoute('/(pages)/(exam)/(packages)/admin/create-package')({
  component: AdminExamPackagesCreatePage,
});

function AdminExamPackagesCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreatePackage();

  const onSubmit = async (values: PackageFormValues) => {
    const payload = {
      ...values,
      educationGradeId: values.educationGradeId ? Number(values.educationGradeId) : undefined,
      requiredTier: values.requiredTier || undefined,
      description: values.description || undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t("exam.packages.list.notifications.createSuccess") });
        queryClient.invalidateQueries({ queryKey: ["exam-packages-list"] });
        navigate({ to: AppRoute.exam.packages.admin.list.url });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t("labels.error") });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t("exam.packages.list.create.title")}
          description={<span>{t("exam.packages.list.create.description")}</span>}
          showBack
          backTo={AppRoute.exam.packages.admin.list.url}
        />
      </div>

      <PackageForm
        onSubmit={onSubmit}
        isPending={createMutation.isPending}
      />
    </div>
  );
}
