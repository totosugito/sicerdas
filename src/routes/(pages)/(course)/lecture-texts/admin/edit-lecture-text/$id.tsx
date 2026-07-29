import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDetailLectureText, useUpdateLectureText } from "@/api/course/lecture-texts";
import { useAppTranslation } from "@/lib/i18n-typed";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { PageTitle, ErrorContainer } from "@/components/app";
import { LectureTextForm, LectureTextFormValues } from "@/features/course/lecture-texts";
import { AppRoute } from "@/constants/app-route";
import { EnumContentStatus } from "backend/src/db/schema/enum/enum-app.ts";

export const Route = createFileRoute(
  "/(pages)/(course)/lecture-texts/admin/edit-lecture-text/$id",
)({
  component: EditLectureTextPage,
});

function EditLectureTextPage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const navigate = useNavigate();

  const { data, isLoading, isError, error } = useDetailLectureText(id);
  const article = data?.data;

  const updateMutation = useUpdateLectureText();

  const handleSubmit = (values: FormData | LectureTextFormValues) => {
    const payload =
      values instanceof FormData
        ? values
        : {
            title: values.title.trim(),
            content: values.content || [],
            categoryId: values.categoryId || null,
            educationGradeId: values.educationGradeId || null,
            status: values.status || EnumContentStatus.DRAFT,
          };

    updateMutation.mutate(
      {
        id,
        payload,
      },
      {
        onSuccess: (res) => {
          showNotifSuccess({ message: res.message || t(($) => $.course.lectureTexts.updateSuccess) });
        },
        onError: (err: any) => {
          showNotifError({ message: err.message || t(($) => $.labels.error) });
        },
      },
    );
  };

  if (isError) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <ErrorContainer
          title={t(($) => $.labels.error)}
          message={error?.message || "Gagal memuat detail artikel"}
          buttonText={t(($) => $.labels.cancel)}
          onButtonClick={() => navigate({ to: AppRoute.course.lectureTexts.admin.list.url })}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded-xl w-1/3" />
        <div className="h-96 bg-muted animate-pulse rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <PageTitle
          title={t(($) => $.course.lectureTexts.editTitle)}
          description={t(($) => $.course.lectureTexts.editDescription)}
          showBack={true}
          backTo={AppRoute.course.lectureTexts.admin.list.url}
        />
      </div>

      {article && (
        <LectureTextForm
          defaultValues={{
            title: article.title || "",
            content: article.content || [],
            categoryId: article.categoryId ?? null,
            educationGradeId: article.educationGradeId ?? null,
            status: article.status || EnumContentStatus.DRAFT,
          }}
          onSubmit={handleSubmit}
          isPending={updateMutation.isPending}
          onCancel={() => navigate({ to: AppRoute.course.lectureTexts.admin.list.url })}
        />
      )}
    </div>
  );
}
