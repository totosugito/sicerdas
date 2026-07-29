import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCreateLectureText } from "@/api/course/lecture-texts";
import { useAppTranslation } from "@/lib/i18n-typed";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { PageTitle } from "@/components/app";
import { LectureTextForm, LectureTextFormValues } from "@/features/course/lecture-texts";
import { AppRoute } from "@/constants/app-route";
import { EnumContentStatus } from "@/api/types";

export const Route = createFileRoute(
  "/(pages)/(course)/lecture-texts/admin/create-lecture-text",
)({
  component: CreateLectureTextPage,
});

function CreateLectureTextPage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();

  const createMutation = useCreateLectureText();

  const handleSubmit = (values: FormData | LectureTextFormValues) => {
    const payload = values instanceof FormData ? values : {
      title: values.title.trim(),
      content: values.content || [],
      categoryId: values.categoryId || null,
      educationGradeId: values.educationGradeId || null,
      status: values.status || EnumContentStatus.DRAFT,
    };

    createMutation.mutate(payload, {
      onSuccess: (res) => {
        showNotifSuccess({ message: res.message || t(($) => $.course.lectureTexts.createSuccess) });
        navigate({ to: AppRoute.course.lectureTexts.admin.list.url });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

  return (
    <div className="container mx-auto space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <PageTitle
          title={t(($) => $.course.lectureTexts.createTitle)}
          description={t(($) => $.course.lectureTexts.createDescription)}
          showBack={true}
          backTo={AppRoute.course.lectureTexts.admin.list.url}
        />
      </div>

      <LectureTextForm
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
        onCancel={() => navigate({ to: AppRoute.course.lectureTexts.admin.list.url })}
      />
    </div>
  );
}
