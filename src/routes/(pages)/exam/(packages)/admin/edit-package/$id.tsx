import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle, ErrorContainer } from "@/components/app";
import { useUpdatePackage, useDetailPackage, useUploadPackageThumbnail } from "@/api/exam-packages";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { AppRoute } from "@/constants/app-route";
import {
  PackageForm,
  type PackageFormValues,
  PackageEditSkeleton,
} from "@/components/pages/exam/packages/create-package";

export const Route = createFileRoute("/(pages)/exam/(packages)/admin/edit-package/$id")({
  component: AdminExamPackagesEditPage,
});

function AdminExamPackagesEditPage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const updateMutation = useUpdatePackage();
  const uploadThumbnailMutation = useUploadPackageThumbnail();
  const { data: detailData, isLoading, isError, error } = useDetailPackage({ id });

  const packageData = detailData?.data;

  const initialData: Partial<PackageFormValues> = useMemo(() => {
    return {
      title: packageData?.title,
      categoryId: packageData?.categoryId,
      examType: packageData?.examType,
      durationMinutes: (packageData?.durationMinutes || 0).toString(),
      educationGradeId: packageData?.educationGradeId ? String(packageData.educationGradeId) : "",
      requiredTier: packageData?.requiredTier || "free",
      description: packageData?.description || "",
      isActive: packageData?.isActive,
      versionId: packageData?.versionId ? String(packageData.versionId) : "",
      thumbnail: packageData?.thumbnail,
    };
  }, [packageData]);

  const onSubmit = async (values: PackageFormValues) => {
    // 1. Handle Thumbnail Removal if requested
    if (values.thumbnail === null && packageData?.thumbnail) {
      try {
        await uploadThumbnailMutation.mutateAsync({ id, action: "remove" });
      } catch (err: any) {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      }
    }

    // 2. Update metadata
    const payload = {
      id,
      ...values,
      durationMinutes: Number(values.durationMinutes) || 0,
      educationGradeId: values.educationGradeId ? Number(values.educationGradeId) : undefined,
      requiredTier: values.requiredTier || undefined,
      description: values.description || undefined,
      versionId: values.versionId ? Number(values.versionId) : undefined,
    };

    updateMutation.mutate(payload, {
      onSuccess: async (res) => {
        // 3. Handle New Thumbnail Upload if selected
        if (values.newThumbnailFile) {
          try {
            await uploadThumbnailMutation.mutateAsync({
              id,
              file: values.newThumbnailFile,
            });
          } catch (uploadError: any) {
            showNotifError({ message: uploadError.message || t(($) => $.labels.error) });
          }
        }

        showNotifSuccess({
          message: res.message || t(($) => $.exam.packages.notifications.updateSuccess),
        });
        queryClient.invalidateQueries({ queryKey: ["admin-exam-packages-detail", id] });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  if (isLoading && !isError) {
    return <PackageEditSkeleton />;
  }

  if (isError || (!isLoading && !detailData?.data)) {
    return (
      <div className="flex flex-col gap-6 w-full">
        <div className="flex items-center gap-4">
          <PageTitle
            title={t(($) => $.exam.packages.edit.title)}
            description={<span>{t(($) => $.exam.packages.edit.description)}</span>}
            showBack
            backTo={AppRoute.exam.packages.admin.list.url}
          />
        </div>

        <ErrorContainer
          title={t(($) => $.labels.error)}
          message={error?.message}
          buttonText={t(($) => $.exam.packages.backToPage)}
          onButtonClick={() =>
            navigate({ to: AppRoute.exam.packages.admin.list.url, replace: true })
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t(($) => $.exam.packages.edit.title)}
          description={<span>{t(($) => $.exam.packages.edit.description)}</span>}
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
