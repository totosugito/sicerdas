import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PageTitle, ErrorContainer } from "@/components/general";
import { EnumContentStatus } from "@/api/types";
import {
  useUpdateCourse,
  useDetailCourse,
  useUploadCourseThumbnail,
} from "@/api/course/courses";
import type { CourseFormValues, AdminUpdateCourseInput } from "@/api/course/courses";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { AppRoute } from "@/constants/app-route";
import {
  CourseForm,
  CourseEditSkeleton,
} from "@/features/course/courses/create-course";

export const Route = createFileRoute(
  "/(pages)/(course)/course/admin/edit-course/$id",
)({
  component: AdminCourseEditPage,
});

function AdminCourseEditPage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const updateMutation = useUpdateCourse();
  const uploadThumbnailMutation = useUploadCourseThumbnail();
  const { data: detailData, isLoading, isError, error } = useDetailCourse(id);

  const courseData = detailData?.data;

  const initialData: Partial<CourseFormValues> = useMemo(() => {
    return {
      courseCode: courseData?.courseCode || "",
      courseName: courseData?.courseName || "",
      categoryId: courseData?.category?.id ? String(courseData.category.id) : "",
      educationGradeId: courseData?.educationGradeId ? String(courseData.educationGradeId) : "",
      courseDescription: courseData?.courseDescription || "",
      whatYouWillLearn: courseData?.whatYouWillLearn || "",
      price: courseData?.price ?? 0,
      instructions: courseData?.instructions || "",
      status: (courseData?.status as any) || EnumContentStatus.DRAFT,
      isPublic: courseData?.isPublic ?? false,
      isSequential: courseData?.isSequential ?? true,
      thumbnail: courseData?.thumbnail,
    };
  }, [courseData]);

  const onSubmit = async (values: CourseFormValues) => {
    // 1. Handle Thumbnail Removal if requested
    if (values.thumbnail === null && courseData?.thumbnail) {
      try {
        await uploadThumbnailMutation.mutateAsync({ id, action: "remove" });
      } catch (err: any) {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      }
    }

    // 2. Update metadata
    const payload: AdminUpdateCourseInput = {
      courseCode: values.courseCode,
      courseName: values.courseName,
      categoryId: values.categoryId,
      educationGradeId: Number(values.educationGradeId),
      courseDescription: values.courseDescription || undefined,
      whatYouWillLearn: values.whatYouWillLearn || undefined,
      price: values.price ? Number(values.price) : 0,
      status: (values.status as any) || EnumContentStatus.DRAFT,
      isPublic: values.isPublic ?? false,
      isSequential: values.isSequential ?? true,
    };

    updateMutation.mutate(
      { id, ...payload },
      {
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
            message: res.message || t(($) => $.course.courses.create.title),
          });
          queryClient.invalidateQueries({ queryKey: ["admin-course-courses-detail", id] });
          queryClient.invalidateQueries({ queryKey: ["admin-course-courses-list"] });
        },
        onError: (err: any) => {
          showNotifError({ message: err.message || t(($) => $.labels.error) });
        },
      },
    );
  };

  if (isLoading && !isError) {
    return <CourseEditSkeleton />;
  }

  if (isError || (!isLoading && !detailData?.data)) {
    return (
      <div className="flex flex-col gap-6 w-full container mx-auto p-4 md:p-6">
        <div className="flex items-center gap-4">
          <PageTitle
            title={t(($) => $.course.courses.create.title)}
            description={<span>{t(($) => $.course.courses.create.description)}</span>}
            showBack
            backTo={AppRoute.course.courses.admin.list.url}
          />
        </div>

        <ErrorContainer
          title={t(($) => $.labels.error)}
          message={error?.message}
          buttonText={t(($) => $.labels.back)}
          onButtonClick={() =>
            navigate({ to: AppRoute.course.courses.admin.list.url, replace: true })
          }
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full container mx-auto p-4 md:p-6">
      <div className="flex items-center gap-4">
        <PageTitle
          title={t(($) => $.course.courses.create.title)}
          description={<span>{t(($) => $.course.courses.create.description)}</span>}
          showBack
          backTo={AppRoute.course.courses.admin.list.url}
        />
      </div>

      <CourseForm
        defaultValues={initialData}
        onSubmit={onSubmit}
        isPending={updateMutation.isPending}
      />
    </div>
  );
}
