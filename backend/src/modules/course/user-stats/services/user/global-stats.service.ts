import { db } from "../../../../../db/db-pool.ts";
import { courseUserStatsGlobal } from "../../../../../db/schema/course/user-stats-global.ts";
import { eq } from "drizzle-orm";

export async function getGlobalStatsService(userId: string) {
  const stats = await db.query.courseUserStatsGlobal.findFirst({
    where: eq(courseUserStatsGlobal.userId, userId),
  });

  return {
    success: true,
    data: {
      userId,
      totalCoursesEnrolled: stats?.totalCoursesEnrolled ?? 0,
      totalCoursesCompleted: stats?.totalCoursesCompleted ?? 0,
      totalLecturesCompleted: stats?.totalLecturesCompleted ?? 0,
      totalWatchTimeMinutes: stats?.totalWatchTimeMinutes ? Number(stats.totalWatchTimeMinutes) : 0,
      lastActiveAt: stats?.lastActiveAt ? stats.lastActiveAt.toISOString() : null,
    },
  };
}
