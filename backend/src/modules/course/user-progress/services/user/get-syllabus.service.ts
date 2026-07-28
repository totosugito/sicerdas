import { db } from "../../../../../db/db-pool.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { courseUserProgress, type SchemaCourseUserProgressSelect } from "../../../../../db/schema/course/user-progress.ts";
import { EnumCourseStatus } from "../../../../../db/schema/course/enums.ts";
import { eq, and, asc } from "drizzle-orm";

export async function getSyllabusService(courseId: string, userId: string) {
  // Check if course exists and is published
  const course = await db.query.courses.findFirst({
    where: and(eq(courses.id, courseId), eq(courses.status, EnumCourseStatus.PUBLISHED)),
  });

  if (!course) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($: any) => $.course.courses.detail.notFound,
    };
  }

  // Get active chapters ordered by position
  const chapters = await db.query.courseChapters.findMany({
    where: and(eq(courseChapters.courseId, courseId), eq(courseChapters.isActive, true)),
    orderBy: [asc(courseChapters.position)],
  });

  const chapterIds = chapters.map((c) => c.id);
  if (chapterIds.length === 0) {
    return {
      success: true,
      data: {
        courseId,
        totalLectures: 0,
        completedLectures: 0,
        progressPercentage: 0,
        chapters: [],
      },
    };
  }

  // Get active lectures
  const lecturesList = await db.query.courseLectures.findMany({
    where: and(eq(courseLectures.isActive, true)),
    orderBy: [asc(courseLectures.position)],
  });

  const courseLecturesFiltered = lecturesList.filter((l) => chapterIds.includes(l.chapterId));

  // Get user progress for this course
  const progressRecords = await db.query.courseUserProgress.findMany({
    where: and(eq(courseUserProgress.userId, userId), eq(courseUserProgress.courseId, courseId)),
  });

  const progressMap = new Map<string, SchemaCourseUserProgressSelect>(
    progressRecords.map((p) => [p.lectureId, p])
  );

  let totalLectures = courseLecturesFiltered.length;
  let completedLectures = 0;

  const chaptersWithLectures = chapters.map((ch) => {
    const chLectures = courseLecturesFiltered
      .filter((l) => l.chapterId === ch.id)
      .map((l) => {
        const prog = progressMap.get(l.id);
        const isCompleted = prog?.isCompleted ?? false;
        if (isCompleted) {
          completedLectures++;
        }

        return {
          id: l.id,
          title: l.title,
          description: l.description,
          chapterId: l.chapterId,
          type: l.type,
          referenceUrl: l.referenceUrl,
          extra: l.extra,
          position: l.position,
          isCompleted,
          watchTimeSeconds: prog?.watchTimeSeconds ?? 0,
          completedAt: prog?.completedAt ? prog.completedAt.toISOString() : null,
        };
      });

    return {
      id: ch.id,
      chapterName: ch.chapterName,
      courseId: ch.courseId,
      position: ch.position,
      lectures: chLectures,
    };
  });

  const progressPercentage = totalLectures > 0
    ? Math.round((completedLectures / totalLectures) * 100)
    : 0;

  return {
    success: true,
    data: {
      courseId,
      totalLectures,
      completedLectures,
      progressPercentage,
      chapters: chaptersWithLectures,
    },
  };
}
