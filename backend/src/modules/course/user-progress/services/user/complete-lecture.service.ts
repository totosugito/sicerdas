import { db } from "../../../../../db/db-pool.ts";
import { courseLectures } from "../../../../../db/schema/course/lectures.ts";
import { courseChapters } from "../../../../../db/schema/course/chapters.ts";
import { courseUserProgress } from "../../../../../db/schema/course/user-progress.ts";
import { courseEnrollments } from "../../../../../db/schema/course/course-enrollments.ts";
import { courseUserStatsGlobal } from "../../../../../db/schema/course/user-stats-global.ts";
import { courseUserStatsCategory } from "../../../../../db/schema/course/user-stats-category.ts";
import { courses } from "../../../../../db/schema/course/courses.ts";
import { examSessions } from "../../../../../db/schema/exam/sessions.ts";
import { EnumEnrollmentStatus, EnumLectureType } from "../../../../../db/schema/course/enums.ts";
import { EnumExamSessionStatus } from "../../../../../db/schema/exam/enums.ts";
import { eq, and, desc, sql } from "drizzle-orm";
import type { ServiceResponse } from "../../../../../types/index.ts";
import type { CompleteLectureData } from "../../user-progress.schema.ts";

export interface CompleteLectureResult extends ServiceResponse {
  data?: CompleteLectureData;
}

export async function completeLectureService(lectureId: string, userId: string): Promise<CompleteLectureResult> {
  // 1. Fetch lecture details
  const lecture = await db.query.courseLectures.findFirst({
    where: and(eq(courseLectures.id, lectureId), eq(courseLectures.isActive, true)),
  });

  if (!lecture) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($: any) => $.course.lectures.detail.notFound,
    };
  }

  // 2. Fetch chapter details to get courseId
  const chapter = await db.query.courseChapters.findFirst({
    where: eq(courseChapters.id, lecture.chapterId),
  });

  if (!chapter) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($: any) => $.course.chapters.detail.notFound,
    };
  }

  const courseId = chapter.courseId;

  // Fetch course details for categoryId
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseId),
  });

  if (!course) {
    return {
      success: false,
      statusCode: 404,
      errorKey: ($: any) => $.course.courses.notFound,
    };
  }

  // Check enrollment
  const enrollment = await db.query.courseEnrollments.findFirst({
    where: and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)),
  });

  if (!enrollment) {
    return {
      success: false,
      statusCode: 403,
      errorKey: ($: any) => $.course.enrollments.enroll.alreadyEnrolled,
    };
  }

  let examScore: number | null = null;
  let passed = true;

  // 3. Check EXAM logic if lecture.type === EXAM
  if (lecture.type === EnumLectureType.EXAM) {
    const sectionId = lecture.referenceUrl;
    if (!sectionId) {
      return {
        success: false,
        statusCode: 400,
        errorKey: ($: any) => $.course.lectures.create.invalidReferenceUrl,
      };
    }

    // Find completed exam session for this section and user
    const lastSession = await db.query.examSessions.findFirst({
      where: and(
        eq(examSessions.userId, userId),
        eq(examSessions.sectionId, sectionId),
        eq(examSessions.status, EnumExamSessionStatus.COMPLETED)
      ),
      orderBy: [desc(examSessions.endTime)],
    });

    if (!lastSession) {
      return {
        success: false,
        statusCode: 400,
        errorKey: ($: any) => $.course.lectures.detail.notFound,
      };
    }

    examScore = lastSession.score ? Number(lastSession.score) : 0;
    const threshold = lecture.extra?.successThreshold ?? 0;

    if (examScore < threshold) {
      passed = false;
      return {
        success: false,
        statusCode: 400,
        errorKey: ($: any) => $.course.lectures.detail.notFound,
      };
    }
  }

  const now = new Date();

  // 4. Record/Update progress
  const existingProgress = await db.query.courseUserProgress.findFirst({
    where: and(
      eq(courseUserProgress.userId, userId),
      eq(courseUserProgress.courseId, courseId),
      eq(courseUserProgress.lectureId, lectureId)
    ),
  });

  const wasAlreadyCompleted = existingProgress?.isCompleted ?? false;

  if (existingProgress) {
    await db
      .update(courseUserProgress)
      .set({
        isCompleted: true,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(courseUserProgress.id, existingProgress.id));
  } else {
    await db.insert(courseUserProgress).values({
      userId,
      courseId,
      lectureId,
      isCompleted: true,
      completedAt: now,
    });
  }

  // 5. Update overall course & global progress stats if newly completed
  if (!wasAlreadyCompleted) {
    // Check total active lectures in this course
    const chapters = await db.query.courseChapters.findMany({
      where: and(eq(courseChapters.courseId, courseId), eq(courseChapters.isActive, true)),
    });

    const chapterIds = chapters.map((c: { id: string }) => c.id);
    const allLectures = chapterIds.length > 0
      ? await db.query.courseLectures.findMany({
          where: and(eq(courseLectures.isActive, true)),
        })
      : [];

    const totalLectures = allLectures.filter((l: { chapterId: string }) => chapterIds.includes(l.chapterId)).length;

    const userCompletedRecords = await db.query.courseUserProgress.findMany({
      where: and(
        eq(courseUserProgress.userId, userId),
        eq(courseUserProgress.courseId, courseId),
        eq(courseUserProgress.isCompleted, true)
      ),
    });

    if (totalLectures > 0 && userCompletedRecords.length >= totalLectures) {
      // Mark course enrollment as completed
      await db
        .update(courseEnrollments)
        .set({
          status: EnumEnrollmentStatus.COMPLETED,
          completedAt: now,
        })
        .where(eq(courseEnrollments.id, enrollment.id));

      // Increment global stats
      await db
        .insert(courseUserStatsGlobal)
        .values({
          userId,
          totalCoursesEnrolled: 1,
          totalCoursesCompleted: 1,
          totalLecturesCompleted: 1,
          lastActiveAt: now,
        })
        .onConflictDoUpdate({
          target: courseUserStatsGlobal.userId,
          set: {
            totalCoursesCompleted: sql`${courseUserStatsGlobal.totalCoursesCompleted} + 1`,
            totalLecturesCompleted: sql`${courseUserStatsGlobal.totalLecturesCompleted} + 1`,
            lastActiveAt: now,
            updatedAt: now,
          },
        });

      // Increment course category stats for user
      await db
        .insert(courseUserStatsCategory)
        .values({
          userId,
          categoryId: course.categoryId,
          coursesCompleted: 1,
        })
        .onConflictDoUpdate({
          target: [courseUserStatsCategory.userId, courseUserStatsCategory.categoryId],
          set: {
            coursesCompleted: sql`${courseUserStatsCategory.coursesCompleted} + 1`,
            updatedAt: now,
          },
        });
    } else {
      // Increment global lectures completed stats
      await db
        .insert(courseUserStatsGlobal)
        .values({
          userId,
          totalCoursesEnrolled: 1,
          totalCoursesCompleted: 0,
          totalLecturesCompleted: 1,
          lastActiveAt: now,
        })
        .onConflictDoUpdate({
          target: courseUserStatsGlobal.userId,
          set: {
            totalLecturesCompleted: sql`${courseUserStatsGlobal.totalLecturesCompleted} + 1`,
            lastActiveAt: now,
            updatedAt: now,
          },
        });
    }
  }

  return {
    success: true,
    data: {
      lectureId,
      courseId,
      isCompleted: true,
      completedAt: now.toISOString(),
      score: examScore,
      passed,
    },
  };
}
