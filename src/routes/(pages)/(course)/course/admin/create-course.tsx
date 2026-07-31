import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle } from "@/components/general";
import { useCreateCourse, useUploadCourseThumbnail, CourseFormValues } from "@/api/course/courses";
import type { AdminCreateCourseInput } from "@/api/course/courses";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useQueryClient } from "@tanstack/react-query";
import { AppRoute } from "@/constants/app-route";
import { CourseForm } from "@/features/course/courses/create-course";

import { EnumContentStatus } from "@/api/types";

export const Route = createFileRoute("/(pages)/(course)/course/admin/create-course")({
  component: AdminCourseCreatePage,
});

function AdminCourseCreatePage() {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const createMutation = useCreateCourse();
  const uploadThumbnailMutation = useUploadCourseThumbnail();

  const onSubmit = async (values: CourseFormValues) => {
    const payload: AdminCreateCourseInput = {
      courseCode: values.courseCode,
      courseName: values.courseName,
      categoryId: values.categoryId,
      educationGradeId: Number(values.educationGradeId),
      courseDescription: values.courseDescription || undefined,
      whatYouWillLearn: values.whatYouWillLearn || undefined,
      price: values.price ? Number(values.price) : 0,
      status: values.status || EnumContentStatus.DRAFT,
      isPublic: values.isPublic ?? false,
      isSequential: values.isSequential ?? true,
      versionId: Number(values.versionId),
    };

    createMutation.mutate(payload, {
      onSuccess: async (res) => {
        const courseId = (res as any).data?.id;

        // Upload Thumbnail if selected
        if (courseId && values.newThumbnailFile) {
          try {
            await uploadThumbnailMutation.mutateAsync({
              id: courseId,
              file: values.newThumbnailFile,
            });
          } catch (uploadError: any) {
            showNotifError({ message: uploadError.message || t(($) => $.labels.error) });
          }
        }

        showNotifSuccess({
          message: res.message || t(($) => $.course.courses.create.title),
        });
        queryClient.invalidateQueries({ queryKey: ["admin-course-courses-list"] });
        navigate({ to: AppRoute.course.courses.admin.list.url });
      },
      onError: (err: any) => {
        showNotifError({ message: err.message || t(($) => $.labels.error) });
      },
    });
  };

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

      <CourseForm onSubmit={onSubmit} isPending={createMutation.isPending} />
    </div>
  );
}
