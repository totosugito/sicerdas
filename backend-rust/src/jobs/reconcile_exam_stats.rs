use sea_orm::{ConnectionTrait, DatabaseConnection, DbBackend, Statement};

pub async fn run(db: &DatabaseConnection) -> Result<(), String> {
    db.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH global_stats AS (
            SELECT
                es.user_id,
                COUNT(DISTINCT CASE WHEN es.status = 'completed' THEN es.id END)::int AS total_exams_taken,
                COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END)::int AS total_questions_answered,
                COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::int AS total_correct_answers,
                COUNT(CASE WHEN esa.is_correct = false THEN 1 END)::int AS total_wrong_answers,
                COALESCE(AVG(CASE WHEN es.status = 'completed' THEN es.score END), 0)::numeric(10,2) AS average_score,
                MAX(es.updated_at) AS last_active_at
            FROM exam_sessions es
            LEFT JOIN exam_session_answers esa ON esa.session_id = es.id
            WHERE es.updated_at >= NOW() - INTERVAL '24 hours'
               OR esa.created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY es.user_id
        )
        INSERT INTO exam_user_stats_global (
            user_id, total_exams_taken, total_questions_answered, total_correct_answers, total_wrong_answers, average_score, last_active_at, updated_at
        )
        SELECT
            user_id, total_exams_taken, total_questions_answered, total_correct_answers, total_wrong_answers, average_score, last_active_at, NOW()
        FROM global_stats
        ON CONFLICT (user_id) DO UPDATE SET
            total_exams_taken = EXCLUDED.total_exams_taken,
            total_questions_answered = EXCLUDED.total_questions_answered,
            total_correct_answers = EXCLUDED.total_correct_answers,
            total_wrong_answers = EXCLUDED.total_wrong_answers,
            average_score = EXCLUDED.average_score,
            last_active_at = EXCLUDED.last_active_at,
            updated_at = NOW()
        WHERE
            exam_user_stats_global.total_exams_taken IS DISTINCT FROM EXCLUDED.total_exams_taken OR
            exam_user_stats_global.total_questions_answered IS DISTINCT FROM EXCLUDED.total_questions_answered OR
            exam_user_stats_global.total_correct_answers IS DISTINCT FROM EXCLUDED.total_correct_answers OR
            exam_user_stats_global.total_wrong_answers IS DISTINCT FROM EXCLUDED.total_wrong_answers OR
            exam_user_stats_global.average_score IS DISTINCT FROM EXCLUDED.average_score
        "#,
        vec![],
    ))
    .await
    .map_err(|e| e.to_string())?;

    db.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH subject_stats AS (
            SELECT
                es.user_id,
                eq.subject_id,
                COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END)::int AS total_questions_answered,
                COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::int AS total_correct,
                COUNT(CASE WHEN esa.is_correct = false THEN 1 END)::int AS total_wrong,
                COALESCE((COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END), 0)) * 100, 0)::numeric(5,2) AS accuracy_rate
            FROM exam_sessions es
            INNER JOIN exam_session_answers esa ON esa.session_id = es.id
            INNER JOIN exam_questions eq ON eq.id = esa.question_id
            WHERE es.updated_at >= NOW() - INTERVAL '24 hours'
               OR esa.created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY es.user_id, eq.subject_id
        )
        INSERT INTO exam_user_stats_subject (
            id, user_id, subject_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, updated_at
        )
        SELECT
            gen_random_uuid(), user_id, subject_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, NOW()
        FROM subject_stats
        ON CONFLICT (user_id, subject_id) DO UPDATE SET
            total_questions_answered = EXCLUDED.total_questions_answered,
            total_correct = EXCLUDED.total_correct,
            total_wrong = EXCLUDED.total_wrong,
            accuracy_rate = EXCLUDED.accuracy_rate,
            updated_at = NOW()
        WHERE
            exam_user_stats_subject.total_questions_answered IS DISTINCT FROM EXCLUDED.total_questions_answered OR
            exam_user_stats_subject.total_correct IS DISTINCT FROM EXCLUDED.total_correct OR
            exam_user_stats_subject.total_wrong IS DISTINCT FROM EXCLUDED.total_wrong OR
            exam_user_stats_subject.accuracy_rate IS DISTINCT FROM EXCLUDED.accuracy_rate
        "#,
        vec![],
    ))
    .await
    .map_err(|e| e.to_string())?;

    db.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        WITH tag_stats AS (
            SELECT
                es.user_id,
                eqt.tag_id,
                COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END)::int AS total_questions_answered,
                COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::int AS total_correct,
                COUNT(CASE WHEN esa.is_correct = false THEN 1 END)::int AS total_wrong,
                COALESCE((COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END), 0)) * 100, 0)::numeric(5,2) AS accuracy_rate
            FROM exam_sessions es
            INNER JOIN exam_session_answers esa ON esa.session_id = es.id
            INNER JOIN exam_question_tags eqt ON eqt.question_id = esa.question_id
            WHERE es.updated_at >= NOW() - INTERVAL '24 hours'
               OR esa.created_at >= NOW() - INTERVAL '24 hours'
            GROUP BY es.user_id, eqt.tag_id
        )
        INSERT INTO exam_user_stats_tag (
            id, user_id, tag_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, updated_at
        )
        SELECT
            gen_random_uuid(), user_id, tag_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, NOW()
        FROM tag_stats
        ON CONFLICT (user_id, tag_id) DO UPDATE SET
            total_questions_answered = EXCLUDED.total_questions_answered,
            total_correct = EXCLUDED.total_correct,
            total_wrong = EXCLUDED.total_wrong,
            accuracy_rate = EXCLUDED.accuracy_rate,
            updated_at = NOW()
        WHERE
            exam_user_stats_tag.total_questions_answered IS DISTINCT FROM EXCLUDED.total_questions_answered OR
            exam_user_stats_tag.total_correct IS DISTINCT FROM EXCLUDED.total_correct OR
            exam_user_stats_tag.total_wrong IS DISTINCT FROM EXCLUDED.total_wrong OR
            exam_user_stats_tag.accuracy_rate IS DISTINCT FROM EXCLUDED.accuracy_rate
        "#,
        vec![],
    ))
    .await
    .map_err(|e| e.to_string())?;

    tracing::info!("[Job] reconcile-exam-stats complete");
    Ok(())
}
