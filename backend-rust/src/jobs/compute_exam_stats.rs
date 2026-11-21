use sea_orm::{ConnectionTrait, DatabaseConnection, DbBackend, Statement};

pub async fn run(db: &DatabaseConnection) -> Result<(), String> {
    db.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH section_stats AS (
            SELECT
                eps.id AS section_id,
                COUNT(epq.question_id)::int AS calculated_total_questions,
                COALESCE(SUM(CASE WHEN eq.is_active = true THEN 1 ELSE 0 END), 0)::int AS calculated_active_questions,
                COALESCE(SUM(eq.max_score), 0)::numeric AS calculated_max_score
            FROM exam_package_sections eps
            LEFT JOIN exam_package_questions epq ON epq.section_id = eps.id
            LEFT JOIN exam_questions eq ON eq.id = epq.question_id
            WHERE eps.updated_at >= NOW() - INTERVAL '24 hours'
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
          )
        "#,
        vec![],
    ))
    .await
    .map_err(|e| e.to_string())?;

    db.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH package_stats AS (
            SELECT
                ep.id AS package_id,
                COUNT(DISTINCT eps.id)::int AS calculated_total_sections,
                COALESCE(SUM(CASE WHEN eps.is_active = true THEN 1 ELSE 0 END), 0)::int AS calculated_active_sections,
                COUNT(DISTINCT epq.question_id)::int AS calculated_total_questions,
                COALESCE(COUNT(DISTINCT CASE WHEN eq.is_active = true THEN epq.question_id END), 0)::int AS calculated_active_questions
            FROM exam_packages ep
            LEFT JOIN exam_package_sections eps ON eps.package_id = ep.id
            LEFT JOIN exam_package_questions epq ON epq.package_id = ep.id
            LEFT JOIN exam_questions eq ON eq.id = epq.question_id
            WHERE ep.updated_at >= NOW() - INTERVAL '24 hours'
               OR eps.updated_at >= NOW() - INTERVAL '24 hours'
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
          )
        "#,
        vec![],
    ))
    .await
    .map_err(|e| e.to_string())?;

    db.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH affected_packages AS (
            SELECT DISTINCT package_id
            FROM exam_package_interactions
            WHERE updated_at >= NOW() - INTERVAL '24 hours'
        ),
        interaction_stats AS (
            SELECT
                package_id,
                COALESCE(SUM(view_count), 0)::int AS calc_view_count,
                COALESCE(SUM(CASE WHEN liked = true THEN 1 ELSE 0 END), 0)::int AS calc_like_count,
                COALESCE(SUM(CASE WHEN disliked = true THEN 1 ELSE 0 END), 0)::int AS calc_dislike_count,
                COALESCE(SUM(CASE WHEN bookmarked = true THEN 1 ELSE 0 END), 0)::int AS calc_bookmark_count,
                COALESCE(SUM(CASE WHEN rating > 0.00 THEN 1 ELSE 0 END), 0)::int AS calc_rating_count,
                COALESCE(SUM(rating), 0)::numeric AS calc_rating_sum,
                CASE
                    WHEN SUM(CASE WHEN rating > 0.00 THEN 1 ELSE 0 END) > 0
                    THEN ROUND((SUM(rating) / SUM(CASE WHEN rating > 0.00 THEN 1 ELSE 0 END))::numeric, 2)
                    ELSE 0.00
                END AS calc_rating
            FROM exam_package_interactions
            WHERE package_id IN (SELECT package_id FROM affected_packages)
            GROUP BY package_id
        )
        INSERT INTO exam_package_event_stats (
            package_id, view_count, like_count, dislike_count, bookmark_count, rating_count, rating_sum, rating
        )
        SELECT
            package_id, calc_view_count, calc_like_count, calc_dislike_count, calc_bookmark_count, calc_rating_count, calc_rating_sum, calc_rating
        FROM interaction_stats
        ON CONFLICT (package_id) DO UPDATE SET
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
            exam_package_event_stats.rating IS DISTINCT FROM EXCLUDED.rating
        "#,
        vec![],
    ))
    .await
    .map_err(|e| e.to_string())?;

    db.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH grade_exam_stats AS (
            SELECT
                category_id,
                education_grade_id,
                COUNT(*)::int AS calc_total_count,
                COUNT(*) FILTER (
                    WHERE is_active = true AND active_sections > 0 AND active_questions > 0
                )::int AS calc_active_count
            FROM exam_packages
            WHERE exam_type = 'official'
              AND education_grade_id IS NOT NULL
            GROUP BY category_id, education_grade_id
        )
        INSERT INTO education_category_grade_stats (
            category_id, education_grade_id, content_type, total_count, active_count, updated_at
        )
        SELECT
            category_id, education_grade_id, 'exam', calc_total_count, calc_active_count, NOW()
        FROM grade_exam_stats
        ON CONFLICT (category_id, education_grade_id, content_type) DO UPDATE SET
            total_count = EXCLUDED.total_count,
            active_count = EXCLUDED.active_count,
            updated_at = NOW()
        WHERE
            education_category_grade_stats.total_count IS DISTINCT FROM EXCLUDED.total_count OR
            education_category_grade_stats.active_count IS DISTINCT FROM EXCLUDED.active_count
        "#,
        vec![],
    ))
    .await
    .map_err(|e| e.to_string())?;

    tracing::info!("[Job] compute-exam-stats complete");
    Ok(())
}
