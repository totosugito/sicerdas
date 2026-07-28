import { db } from "../../../../db/db-pool.ts";
import { sql } from "drizzle-orm";

/**
 * Scheduled job to reconcile and compute course statistics:
 * 1. `course_chapters`: `totalLectures`, `activeLectures`
 * 2. `courses`: `totalChapters`, `activeChapters`, `totalLectures`, `activeLectures`
 * 3. `course_stats`: `totalChapters`, `totalLectures`, `totalStudents`, `totalRatings`, `averageRating`
 *
 * Performance features:
 * 1. Single SQL CTE queries for fast bulk processing.
 * 2. 24-hour window filter to process only recently updated/interacted records.
 * 3. `IS DISTINCT FROM` guards to prevent unnecessary DB updates when no data has changed.
 */
export const computeCourseStats = async () => {
  console.log("[Job] Starting compute-course-stats...");

  try {
    // 1. Reconcile Chapter Counters (totalLectures, activeLectures)
    await db.execute(sql`
      WITH chapter_stats AS (
        SELECT 
          cc.id as chapter_id,
          COUNT(cl.id)::int as calculated_total_lectures,
          COALESCE(SUM(CASE WHEN cl.is_active = true THEN 1 ELSE 0 END), 0)::int as calculated_active_lectures
        FROM course_chapters cc
        LEFT JOIN course_lectures cl ON cl.chapter_id = cc.id
        WHERE cc.updated_at >= NOW() - INTERVAL '24 hours'
           OR cl.created_at >= NOW() - INTERVAL '24 hours'
           OR cl.updated_at >= NOW() - INTERVAL '24 hours'
        GROUP BY cc.id
      )
      UPDATE course_chapters cc
      SET 
        total_lectures = cs.calculated_total_lectures,
        active_lectures = cs.calculated_active_lectures,
        updated_at = NOW()
      FROM chapter_stats cs
      WHERE cc.id = cs.chapter_id
        AND (
          cc.total_lectures IS DISTINCT FROM cs.calculated_total_lectures OR
          cc.active_lectures IS DISTINCT FROM cs.calculated_active_lectures
        );
    `);

    // 2. Reconcile Course Counters (totalChapters, activeChapters, totalLectures, activeLectures)
    await db.execute(sql`
      WITH course_counters AS (
        SELECT 
          c.id as course_id,
          COUNT(DISTINCT cc.id)::int as calculated_total_chapters,
          COALESCE(SUM(CASE WHEN cc.is_active = true THEN 1 ELSE 0 END), 0)::int as calculated_active_chapters,
          COUNT(DISTINCT cl.id)::int as calculated_total_lectures,
          COALESCE(COUNT(DISTINCT CASE WHEN cl.is_active = true THEN cl.id END), 0)::int as calculated_active_lectures
        FROM courses c
        LEFT JOIN course_chapters cc ON cc.course_id = c.id
        LEFT JOIN course_lectures cl ON cl.chapter_id = cc.id
        WHERE c.updated_at >= NOW() - INTERVAL '24 hours'
           OR cc.updated_at >= NOW() - INTERVAL '24 hours'
           OR cl.updated_at >= NOW() - INTERVAL '24 hours'
        GROUP BY c.id
      )
      UPDATE courses c
      SET 
        total_chapters = cc.calculated_total_chapters,
        active_chapters = cc.calculated_active_chapters,
        total_lectures = cc.calculated_total_lectures,
        active_lectures = cc.calculated_active_lectures,
        updated_at = NOW()
      FROM course_counters cc
      WHERE c.id = cc.course_id
        AND (
          c.total_chapters IS DISTINCT FROM cc.calculated_total_chapters OR
          c.active_chapters IS DISTINCT FROM cc.calculated_active_chapters OR
          c.total_lectures IS DISTINCT FROM cc.calculated_total_lectures OR
          c.active_lectures IS DISTINCT FROM cc.calculated_active_lectures
        );
    `);

    // 3. Reconcile Course Stats Table (totalChapters, totalLectures, totalStudents, totalRatings, averageRating)
    await db.execute(sql`
      WITH course_aggregated_stats AS (
        SELECT 
          c.id as course_id,
          COUNT(DISTINCT cc.id)::int as calc_total_chapters,
          COUNT(DISTINCT cl.id)::int as calc_total_lectures,
          COUNT(DISTINCT ce.id)::int as calc_total_students,
          COALESCE(SUM(CASE WHEN ce.rating > '0.00' THEN 1 ELSE 0 END), 0)::int as calc_total_ratings,
          CASE 
            WHEN SUM(CASE WHEN ce.rating > '0.00' THEN 1 ELSE 0 END) > 0 
            THEN ROUND((SUM(ce.rating) / SUM(CASE WHEN ce.rating > '0.00' THEN 1 ELSE 0 END))::numeric, 2)
            ELSE 0.00 
          END as calc_average_rating
        FROM courses c
        LEFT JOIN course_chapters cc ON cc.course_id = c.id
        LEFT JOIN course_lectures cl ON cl.chapter_id = cc.id
        LEFT JOIN course_enrollments ce ON ce.course_id = c.id
        WHERE c.updated_at >= NOW() - INTERVAL '24 hours'
           OR cc.updated_at >= NOW() - INTERVAL '24 hours'
           OR cl.updated_at >= NOW() - INTERVAL '24 hours'
           OR ce.enrolled_at >= NOW() - INTERVAL '24 hours'
           OR ce.completed_at >= NOW() - INTERVAL '24 hours'
        GROUP BY c.id
      )
      INSERT INTO course_stats (
        course_id, total_chapters, total_lectures, total_students, total_ratings, average_rating, last_updated
      )
      SELECT 
        course_id, calc_total_chapters, calc_total_lectures, calc_total_students, calc_total_ratings, calc_average_rating, NOW()
      FROM course_aggregated_stats
      ON CONFLICT (course_id) DO UPDATE
      SET 
        total_chapters = EXCLUDED.total_chapters,
        total_lectures = EXCLUDED.total_lectures,
        total_students = EXCLUDED.total_students,
        total_ratings = EXCLUDED.total_ratings,
        average_rating = EXCLUDED.average_rating,
        last_updated = NOW()
      WHERE 
        course_stats.total_chapters IS DISTINCT FROM EXCLUDED.total_chapters OR
        course_stats.total_lectures IS DISTINCT FROM EXCLUDED.total_lectures OR
        course_stats.total_students IS DISTINCT FROM EXCLUDED.total_students OR
        course_stats.total_ratings IS DISTINCT FROM EXCLUDED.total_ratings OR
        course_stats.average_rating IS DISTINCT FROM EXCLUDED.average_rating;
    `);

    console.log("[Job] compute-course-stats completed successfully.");
  } catch (error) {
    console.error("[Job] Error in compute-course-stats:", error);
  }
};
