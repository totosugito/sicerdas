import React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useDetailCourseClient, useCourseStructureClient } from "@/api/course/courses";
import { useAppTranslation } from "@/lib/i18n-typed";
import { PageTitle, ErrorPageDetails } from "@/components/general";
import { AppRoute } from "@/constants/app-route";
import { AlertCircle } from "lucide-react";
import {
  CourseHeader,
  CourseContent,
  CourseActionCard,
  CourseDetailSkeleton,
} from "@/features/course/courses/info-course";

export const Route = createFileRoute("/(pages)/(course)/course/$id/")({
  component: CourseDetailPage,
});

function CourseDetailPage() {
  const { id } = Route.useParams();
  const { t } = useAppTranslation();
  const navigate = useNavigate();

  const {
    data: detailData,
    isLoading: isDetailLoading,
    isError: isDetailError,
    error: detailError,
  } = useDetailCourseClient(id);
  const course = detailData?.data;

  const { data: structureData, isLoading: isStructureLoading } = useCourseStructureClient(id);
  const chapters = structureData?.data || [];

  if (isDetailLoading) {
    return <CourseDetailSkeleton />;
  }

  if (isDetailError) {
    return (
      <ErrorPageDetails
        icon={AlertCircle}
        title={t(($) => $.labels.error)}
        description={detailError?.message}
        backLabel={t(($) => $.labels.back)}
        onBack={() => navigate({ to: AppRoute.course.courses.courses.url })}
      />
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50/50 dark:bg-slate-900/20">
      {/* Top Breadcrumb/Back area */}
      <div className="container mx-auto px-4 md:px-6 pt-6">
        <PageTitle
          title={course?.courseName || t(($) => $.course.public.detail.title)}
          description={course?.category?.name || t(($) => $.course.courses.table.columns.category)}
          showBack={true}
          backTo={AppRoute.course.courses.courses.url}
        />
      </div>

      <div className="container mx-auto px-4 md:px-6 pb-12 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main details (Left Side) */}
          <div className="lg:col-span-2 space-y-6">
            <CourseHeader course={course} />
            <CourseContent chapters={chapters} isStructureLoading={isStructureLoading} />
          </div>

          {/* Action Card (Right Side) */}
          <div className="space-y-6">
            <CourseActionCard course={course} />
          </div>
        </div>
      </div>
    </div>
  );
}
