import { db } from "../../../../db/db-pool.ts";
import { sql } from "drizzle-orm";

/**
 * Scheduled job to reconcile and compute exam package, section counters,
 * and user event interaction statistics.
 *
 * Performance features:
 * 1. Single CTE SQL queries for fast execution.
 * 2. 24-hour window filter to only query recently updated records.
 * 3. `IS DISTINCT FROM` guards to prevent unnecessary DB updates/writes when no data changed.
 */
export const computeExamStats = async () => {
  console.log("[Job] Starting compute-exam-stats...");

  try {
    // 1. Reconcile Section Counters (Only sections/questions updated in the last 24 hours)
    await db.execute(sql`
      WITH section_stats AS (
        SELECT 
          eps.id as section_id,
          COUNT(epq.question_id)::int as calculated_total_questions,
          COALESCE(SUM(CASE WHEN eq.is_active = true THEN 1 ELSE 0 END), 0)::int as calculated_active_questions,
          COALESCE(SUM(eq.max_score), 0)::numeric as calculated_max_score
        FROM exam_package_sections eps
        LEFT JOIN exam_package_questions epq ON epq.section_id = eps.id
        LEFT JOIN exam_questions eq ON eq.id = epq.question_id
        WHERE eps.updated_at >= NOW() - INTERVAL '24 hours'
           OR epq.created_at >= NOW() - INTERVAL '24 hours'
           OR eq.updated_at >= NOW() - INTERVAL '24 hours'
        GROUP BY eps.id
      )
      UPDATE exam_package_sections eps
      SET 
        total_questions = ss.calculated_total_questions,
        active_questions = ss.calculated_active_questions,
        max_score = ss.calculated_max_score,
        updated_at = NOW()
      FROM section_stats ss
      WHERE eps.id = ss.section_id
        AND (
          eps.total_questions IS DISTINCT FROM ss.calculated_total_questions OR
          eps.active_questions IS DISTINCT FROM ss.calculated_active_questions OR
          eps.max_score IS DISTINCT FROM ss.calculated_max_score
        );
    `);

    // 2. Reconcile Package Counters (Only packages/sections updated in the last 24 hours)
    await db.execute(sql`
      WITH package_stats AS (
        SELECT 
          ep.id as package_id,
          COUNT(DISTINCT eps.id)::int as calculated_total_sections,
          COALESCE(SUM(CASE WHEN eps.is_active = true THEN 1 ELSE 0 END), 0)::int as calculated_active_sections,
          COUNT(DISTINCT epq.question_id)::int as calculated_total_questions,
          COALESCE(COUNT(DISTINCT CASE WHEN eq.is_active = true THEN epq.question_id END), 0)::int as calculated_active_questions
        FROM exam_packages ep
        LEFT JOIN exam_package_sections eps ON eps.package_id = ep.id
        LEFT JOIN exam_package_questions epq ON epq.package_id = ep.id
        LEFT JOIN exam_questions eq ON eq.id = epq.question_id
        WHERE ep.updated_at >= NOW() - INTERVAL '24 hours'
           OR eps.updated_at >= NOW() - INTERVAL '24 hours'
           OR epq.created_at >= NOW() - INTERVAL '24 hours'
           OR eq.updated_at >= NOW() - INTERVAL '24 hours'
        GROUP BY ep.id
      )
      UPDATE exam_packages ep
      SET 
        total_sections = ps.calculated_total_sections,
        active_sections = ps.calculated_active_sections,
        total_questions = ps.calculated_total_questions,
        active_questions = ps.calculated_active_questions,
        updated_at = NOW()
      FROM package_stats ps
      WHERE ep.id = ps.package_id
        AND (
          ep.total_sections IS DISTINCT FROM ps.calculated_total_sections OR
          ep.active_sections IS DISTINCT FROM ps.calculated_active_sections OR
          ep.total_questions IS DISTINCT FROM ps.calculated_total_questions OR
          ep.active_questions IS DISTINCT FROM ps.calculated_active_questions
        );
    `);

    // 3. Reconcile Package Event Stats (Only packages with interaction changes in last 24 hours)
    await db.execute(sql`
      WITH interaction_stats AS (
        SELECT 
          package_id,
          COALESCE(SUM(view_count), 0)::int as calc_view_count,
          COALESCE(SUM(CASE WHEN liked = true THEN 1 ELSE 0 END), 0)::int as calc_like_count,
          COALESCE(SUM(CASE WHEN disliked = true THEN 1 ELSE 0 END), 0)::int as calc_dislike_count,
          COALESCE(SUM(CASE WHEN bookmarked = true THEN 1 ELSE 0 END), 0)::int as calc_bookmark_count,
          COALESCE(SUM(CASE WHEN rating > '0.00' THEN 1 ELSE 0 END), 0)::int as calc_rating_count,
          COALESCE(SUM(rating), 0)::numeric as calc_rating_sum,
          CASE 
            WHEN SUM(CASE WHEN rating > '0.00' THEN 1 ELSE 0 END) > 0 
            THEN ROUND((SUM(rating) / SUM(CASE WHEN rating > '0.00' THEN 1 ELSE 0 END))::numeric, 2)
            ELSE 0.00 
          END as calc_rating
        FROM exam_package_interactions
        WHERE updated_at >= NOW() - INTERVAL '24 hours'
        GROUP BY package_id
      )
      INSERT INTO exam_package_event_stats (
        package_id, view_count, like_count, dislike_count, bookmark_count, rating_count, rating_sum, rating
      )
      SELECT 
        package_id, calc_view_count, calc_like_count, calc_dislike_count, calc_bookmark_count, calc_rating_count, calc_rating_sum, calc_rating
      FROM interaction_stats
      ON CONFLICT (package_id) DO UPDATE
      SET 
        view_count = EXCLUDED.view_count,
        like_count = EXCLUDED.like_count,
        dislike_count = EXCLUDED.dislike_count,
        bookmark_count = EXCLUDED.bookmark_count,
        rating_count = EXCLUDED.rating_count,
        rating_sum = EXCLUDED.rating_sum,
        rating = EXCLUDED.rating,
        updated_at = NOW()
      WHERE 
        exam_package_event_stats.view_count IS DISTINCT FROM EXCLUDED.view_count OR
        exam_package_event_stats.like_count IS DISTINCT FROM EXCLUDED.like_count OR
        exam_package_event_stats.dislike_count IS DISTINCT FROM EXCLUDED.dislike_count OR
        exam_package_event_stats.bookmark_count IS DISTINCT FROM EXCLUDED.bookmark_count OR
        exam_package_event_stats.rating_count IS DISTINCT FROM EXCLUDED.rating_count OR
        exam_package_event_stats.rating_sum IS DISTINCT FROM EXCLUDED.rating_sum OR
        exam_package_event_stats.rating IS DISTINCT FROM EXCLUDED.rating;
    `);

    console.log("[Job] compute-exam-stats completed successfully.");
  } catch (error) {
    console.error("[Job] Error in compute-exam-stats:", error);
  }
};
