import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useCourseSyllabus, useCompleteLecture } from "@/api/course/user-progress";
import { useCourseLectureText } from "@/api/course/lecture-texts";
import { useEnrollCourse } from "@/api/course/enrollments";
import { useDetailCourseClient } from "@/api/course/courses";
import { ErrorPageDetails } from "@/components/general";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AppRoute } from "@/constants/app-route";
import { EnumLectureType } from "backend/src/db/schema/course/enums.ts";
import { useAppTranslation } from "@/lib/i18n-typed";
import { showNotifError, showNotifSuccess } from "@/lib/show-notif";
import { useStartSession } from "@/api/exam/sessions";
import { EnumExamSessionMode } from "@/api/exam/types";
import {
  PlayerHeader,
  PlayerSidebar,
  PlayerContent,
  PlayerSkeleton,
  PlayerLecture,
  PlayerChapter,
} from "@/features/course/courses/player-course";

export const Route = createFileRoute("/(pages)/(course)/course/$id/player")({ component: CoursePlayerPage });

function CoursePlayerPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useAppTranslation();
  const queryClient = useQueryClient();
  const syllabus = useCourseSyllabus(id);
  const course = useDetailCourseClient(id);
  const enroll = useEnrollCourse();
  const complete = useCompleteLecture();
  const startSession = useStartSession();
  const [selectedId, setSelectedId] = useState<string>();

  const lectures = useMemo(() => syllabus.data?.data.chapters.flatMap((chapter) => chapter.lectures as PlayerLecture[]) ?? [], [syllabus.data]);
  const selected = lectures.find((lecture) => lecture.id === selectedId) ?? lectures[0];
  const selectedTextId = selected?.type === EnumLectureType.TEXT ? selected.referenceUrl : null;
  const text = useCourseLectureText(selectedTextId);

  useEffect(() => {
    if (selected?.id) {
      setSelectedId(selected.id);
    }
  }, [selected?.id]);

  const selectLecture = (lecture: PlayerLecture) => {
    setSelectedId(lecture.id);
  };

  const markComplete = () => {
    if (!selected) return;
    complete.mutate(selected.id, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["course-syllabus", id] });
        showNotifSuccess({ message: t(($) => $.course.public.player.completeSuccess) });
      },
      onError: (error: any) => showNotifError({ message: error?.message || t(($) => $.labels.error) }),
    });
  };

  const handleEnroll = () => enroll.mutate(id, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-syllabus", id] });
      showNotifSuccess({ message: t(($) => $.course.public.player.enrollSuccess) });
    },
    onError: (error: any) => showNotifError({ message: error?.message || t(($) => $.labels.error) }),
  });

  const launchExam = () => {
    if (!selected?.packageId || !selected.referenceUrl) return;
    startSession.mutate(
      { packageId: selected.packageId, sectionId: selected.referenceUrl, mode: EnumExamSessionMode.TRYOUT },
      {
        onSuccess: (response) => navigate({ to: AppRoute.exam.session.url, params: { id: response.data.sessionId } }),
        onError: (error: any) => showNotifError({ message: error?.message || t(($) => $.course.public.player.examUnavailable) }),
      },
    );
  };

  const moveLecture = (direction: -1 | 1) => {
    const index = selected ? lectures.findIndex((lecture) => lecture.id === selected.id) : -1;
    const next = lectures[index + direction];
    if (next) selectLecture(next);
  };

  const index = selected ? lectures.findIndex((lecture) => lecture.id === selected.id) : -1;
  const hasPrev = index > 0;
  const hasNext = index >= 0 && index < lectures.length - 1;

  if (course.isLoading || syllabus.isLoading) {
    return <PlayerSkeleton />;
  }

  if (course.isError || syllabus.isError) {
    const errorMessage = (course.error as any)?.message || (syllabus.error as any)?.message || t(($) => $.course.public.player.loadError);
    return (
      <ErrorPageDetails
        icon={AlertCircle}
        title={t(($) => $.labels.error)}
        description={errorMessage}
        backLabel={t(($) => $.labels.back)}
        onBack={() => navigate({ to: AppRoute.course.courses.detail.url, params: { id } })}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950/40 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <PlayerHeader
          courseName={course.data?.data.courseName}
          completedLectures={syllabus.data?.data.completedLectures}
          totalLectures={syllabus.data?.data.totalLectures}
          progressPercentage={syllabus.data?.data.progressPercentage}
          onBack={() => navigate({ to: AppRoute.course.courses.detail.url, params: { id } })}
        />

        <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
          <PlayerSidebar
            chapters={(syllabus.data?.data.chapters || []) as PlayerChapter[]}
            selectedId={selected?.id}
            onSelectLecture={selectLecture}
          />
          <PlayerContent
            selected={selected}
            textLoading={text.isLoading}
            textContent={text.data?.data.content as any[]}
            examPending={startSession.isPending}
            completePending={complete.isPending}
            onLaunchExam={launchExam}
            onMarkComplete={markComplete}
            onPrev={() => moveLecture(-1)}
            onNext={() => moveLecture(1)}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        </div>
        {syllabus.data?.data.totalLectures === 0 && <Card><CardContent className="flex flex-col items-center gap-3 p-8 text-center"><RotateCcw className="h-8 w-8 text-muted-foreground" /><p>{t(($) => $.course.public.player.empty)}</p><Button onClick={handleEnroll} disabled={enroll.isPending}>{t(($) => $.course.public.detail.enroll)}</Button></CardContent></Card>}
      </div>
    </div>
  );
}
