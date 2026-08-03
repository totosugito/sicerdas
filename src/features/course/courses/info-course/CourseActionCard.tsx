import React, { useState } from "react";
import { CourseUserDetail, useBookmarkCourse, useRateCourse } from "@/api/course/courses";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ImageIcon, ChevronRight, CheckCircle2, Loader2, BookOpen, Bookmark, Star } from "lucide-react";
import { showNotifSuccess, showNotifError } from "@/lib/show-notif";
import { useAppTranslation } from "@/lib/i18n-typed";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEnrollCourse } from "@/api/course/enrollments";
import { AppRoute } from "@/constants/app-route";
import { DialogModal } from "@/components/dialog/DialogModal";
import { Progress } from "@/components/ui/progress";
import { EnumEnrollmentStatus } from "@/api/course/types";
import { CourseRatingDialog } from "./CourseRatingDialog";

interface CourseActionCardProps {
  course?: CourseUserDetail;
}

export function CourseActionCard({ course }: CourseActionCardProps) {
  const { t } = useAppTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const enrollMutation = useEnrollCourse();
  const bookmarkMutation = useBookmarkCourse();
  const rateMutation = useRateCourse();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);

  const handleToggleBookmark = () => {
    if (!course) return;
    bookmarkMutation.mutate(course.id, {
      onSuccess: (res: any) => {
        showNotifSuccess({ message: res?.message || t(($) => $.course.chapters.form.updateSuccess) });
      },
      onError: (err: any) => {
        showNotifError({ message: err?.message || t(($) => $.course.public.player.loadError) });
      },
    });
  };

  const handleRate = async (rating: number) => {
    if (!course) return;
    try {
      const res = await rateMutation.mutateAsync({ courseId: course.id, rating });
      showNotifSuccess({ message: res?.message || t(($) => $.course.chapters.form.updateSuccess) });
    } catch (err: any) {
      showNotifError({ message: err?.message || t(($) => $.course.public.player.loadError) });
      throw err;
    }
  };

  const handleEnrollOrStart = () => {
    if (!course) return;

    if (course.progress?.enrollmentStatus === EnumEnrollmentStatus.ACTIVE || course.progress?.enrollmentStatus === EnumEnrollmentStatus.COMPLETED) {
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

  const isEnrolled =
    course?.progress?.enrollmentStatus === EnumEnrollmentStatus.ACTIVE ||
    course?.progress?.enrollmentStatus === EnumEnrollmentStatus.COMPLETED;

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
          {isEnrolled && course?.progress ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-bold text-slate-700 dark:text-slate-350">
                  {t(($) => $.course.public.player.progress)}
                </span>
                <span className="font-extrabold text-primary">
                  {course.progress.progressPercentage}%
                </span>
              </div>
              <Progress value={course.progress.progressPercentage} />
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                {course.progress.completedLectures}/{course.totalLectures} {t(($) => $.course.public.player.completed)}
              </p>
            </div>
          ) : (
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
          )}

          <div className="flex gap-2">
            <Button
              className="flex-1 font-bold gap-2"
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

            {isEnrolled && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleToggleBookmark}
                disabled={bookmarkMutation.isPending}
                className="h-8 w-8"
              >
                {bookmarkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Bookmark
                    className={`h-5 w-5 ${course?.progress?.bookmarked
                      ? "text-primary fill-primary"
                      : "text-slate-500"
                      }`}
                  />
                )}
              </Button>
            )}
          </div>

          {isEnrolled && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-555 uppercase tracking-wider">
                  {t(($) => $.labels.rating)}
                </span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const isFilled = star <= (course?.progress?.rating || 0);
                    return (
                      <button
                        key={star}
                        onClick={() => setIsRatingOpen(true)}
                        className="focus:outline-none transition-transform active:scale-90"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${isFilled
                            ? "text-amber-500 fill-amber-500"
                            : "text-slate-350 dark:text-slate-650 hover:text-amber-400"
                            }`}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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

      <CourseRatingDialog
        isOpen={isRatingOpen}
        onOpenChange={setIsRatingOpen}
        onRate={handleRate}
        initialRating={course?.progress?.rating ?? 0}
        courseTitle={course?.courseName}
      />
    </>
  );
}

