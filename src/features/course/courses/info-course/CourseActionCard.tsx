import React, { useState } from "react";
import { CourseUserDetail } from "@/api/course/courses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, ChevronRight, CheckCircle2, Loader2, BookOpen } from "lucide-react";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEnrollCourse } from "@/api/course/enrollments";
import { AppRoute } from "@/constants/app-route";
import { DialogModal } from "@/components/dialog/DialogModal";

interface CourseActionCardProps {
  course?: CourseUserDetail;
}

export function CourseActionCard({ course }: CourseActionCardProps) {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const enrollMutation = useEnrollCourse();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handleEnrollOrStart = () => {
    if (!course) return;

    if (course.progress?.enrollmentStatus === "active") {
      navigate({
        to: AppRoute.course.courses.player.url,
        params: { id: course.id },
      });
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirmEnroll = () => {
    if (!course) return;

    enrollMutation.mutate(course.id, {
      onSuccess: () => {
        setIsConfirmOpen(false);
        // Invalidate detail course query
        queryClient.invalidateQueries({
          queryKey: ["course-courses-detail", course.id],
        });
        // Redirect to player
        navigate({
          to: AppRoute.course.courses.player.url,
          params: { id: course.id },
        });
      },
    });
  };

  const isEnrolled = course?.progress?.enrollmentStatus === "active";

  return (
    <>
      <Card className="overflow-hidden border-border/40 shadow-sm sticky top-6">
        {/* Media Thumbnail Container */}
        <div className="relative aspect-[16/9] w-full bg-slate-100 dark:bg-slate-800">
          {course?.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.courseName}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
              <ImageIcon className="h-12 w-12 text-primary/20" />
            </div>
          )}
        </div>

        <CardContent className="p-6 space-y-6">
          <div>
            <span className="text-xs text-slate-400 dark:text-slate-500 uppercase font-bold block mb-1">
              {t(($) => $.course.public.detail.pricing)}
            </span>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {course?.price === 0 ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  {t(($) => $.course.public.detail.free)}
                </span>
              ) : (
                `Rp ${course?.price?.toLocaleString("id-ID")}`
              )}
            </div>
          </div>

          <Button
            className="w-full py-6 font-bold text-base rounded-xl shadow-md gap-2"
            onClick={handleEnrollOrStart}
            disabled={enrollMutation.isPending}
          >
            {enrollMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <span>
                  {isEnrolled
                    ? t(($) => $.course.public.player.continueCourse)
                    : t(($) => $.course.public.detail.enroll)}
                </span>
                <ChevronRight className="h-5 w-5" />
              </>
            )}
          </Button>

          {/* Info Bullet points */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{t(($) => $.course.public.detail.bullet1)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{t(($) => $.course.public.detail.bullet2)}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{t(($) => $.course.public.detail.bullet3)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogModal
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        variantSubmit="default"
        modal={{
          title: t(($) => $.course.public.detail.enroll),
          desc: (
            <span>
              {t(($) => $.course.public.detail.confirmEnrollDesc)}{" "}
              <span className="inline-block px-2 py-0.5 mx-1 font-semibold text-primary bg-primary/10 dark:bg-primary/20 rounded-md">
                {course?.courseName}
              </span>
              ?
            </span>
          ),
          textConfirm: t(($) => $.course.public.detail.enroll),
          textCancel: t(($) => $.course.lectures.picker.btnCancel),
          iconType: "question",
          showCloseButton: true,
          onConfirmClick: handleConfirmEnroll,
          onCancelClick: () => setIsConfirmOpen(false),
        }}
      />
    </>
  );
}

