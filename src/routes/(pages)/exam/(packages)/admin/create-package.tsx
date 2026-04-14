import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/app";
import { useCreatePackage } from "@/api/exam-packages";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useQueryClient } from "@tanstack/react-query";
import { AppRoute } from "@/constants/app-route";
import { PackageForm, PackageFormValues } from "@/components/pages/exam/packages/create-package";
import { useUploadPackageThumbnail } from "@/api/exam-packages";

export const Route = createFileRoute("/(pages)/exam/(packages)/admin/create-package")({
  component: AdminExamPackagesCreatePage,
});

function AdminExamPackagesCreatePage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreatePackage();
  const uploadThumbnailMutation = useUploadPackageThumbnail();

  const onSubmit = async (values: PackageFormValues) => {
    const payload = {
      ...values,
      durationMinutes: Number(values.durationMinutes) || 0,
      educationGradeId: values.educationGradeId ? Number(values.educationGradeId) : undefined,
      requiredTier: values.requiredTier || undefined,
      description: values.description || undefined,
      versionId: values.versionId ? Number(values.versionId) : undefined,
    };

    createMutation.mutate(payload, {
      onSuccess: async (res) => {
        const packageId = (res as any).data?.id;

        // Handle Thumbnail Upload if a file was selected
        if (packageId && values.newThumbnailFile) {
          try {
            await uploadThumbnailMutation.mutateAsync({
              id: packageId,
              file: values.newThumbnailFile,
            });
          } catch (uploadError: any) {
            showNotifError({ message: uploadError.message || t(($) => $.labels.error) });
          }
        }

        showNotifSuccess({
          message: res.message || t(($) => $.exam.packages.notifications.createSuccess),
        });
        navigate({ to: AppRoute.exam.packages.admin.list.url });
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
          title={t(($) => $.exam.packages.create.title)}
          description={<span>{t(($) => $.exam.packages.create.description)}</span>}
          showBack
          backTo={AppRoute.exam.packages.admin.list.url}
        />
      </div>

      <PackageForm onSubmit={onSubmit} isPending={createMutation.isPending} />
    </div>
  );
}
