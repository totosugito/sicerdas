use crate::app::AppState;
use crate::db::entities::exam::enums::ExamSessionStatus;
use crate::db::entities::exam::exam_sessions;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::SubmitSessionData;
use sea_orm::{
    ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, FromQueryResult, QueryFilter, Statement,
    TransactionTrait, Value,
};
use serde_json::Value as JsonValue;
use std::collections::{HashMap, HashSet};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct AnswerRow {
    id: Uuid,
    question_id: Uuid,
    selected_option_id: Option<Uuid>,
    text_answer: Option<JsonValue>,
    subject_id: Uuid,
    max_score: Option<f64>,
    earned_score: Option<f64>,
}

#[derive(Debug, FromQueryResult)]
struct CorrectOptionRow {
    id: Uuid,
    question_id: Uuid,
}

#[derive(Debug, FromQueryResult)]
struct QuestionTagRow {
    question_id: Uuid,
    tag_id: Uuid,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    count: i64,
}

#[derive(Debug, FromQueryResult)]
struct PkgTotalSectionsRow {
    total_sections: i32,
}

#[derive(Default)]
struct StatBucket {
    total: i32,
    correct: i32,
    wrong: i32,
    skipped: i32,
}

pub async fn submit_session(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    session_id: Uuid,
) -> Result<SubmitSessionData, AppError> {
    let session = exam_sessions::Entity::find_by_id(session_id)
        .filter(exam_sessions::Column::UserId.eq(user_id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsSubmitNotFound)))?;

    if session.status != ExamSessionStatus::InProgress {
        return Err(AppError::Forbidden(translate(
            lang,
            LocaleKey::ExamSessionsSubmitAlreadySubmitted,
        )));
    }

    let student_answers = AnswerRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            esa.id,
            esa.question_id,
            esa.selected_option_id,
            esa.text_answer,
            eq.subject_id,
            eq.max_score::float8 AS max_score,
            eqo.score::float8 AS earned_score
        FROM exam_session_answers esa
        INNER JOIN exam_questions eq ON eq.id = esa.question_id
        LEFT JOIN exam_question_options eqo ON eqo.id = esa.selected_option_id
        WHERE esa.session_id = $1
        "#,
        vec![Value::Uuid(Some(Box::new(session_id)))],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    if student_answers.is_empty() {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::ExamSessionsSubmitNoQuestions,
        )));
    }

    let q_ids: Vec<Value> = student_answers
        .iter()
        .map(|a| Value::Uuid(Some(Box::new(a.question_id))))
        .collect();
    let q_array = Value::Array(sea_orm::sea_query::ArrayType::Uuid, Some(Box::new(q_ids)));

    let correct_options = CorrectOptionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT id, question_id FROM exam_question_options WHERE question_id = ANY($1) AND is_correct = true",
        vec![q_array.clone()],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut correct_map: HashMap<Uuid, HashSet<Uuid>> = HashMap::new();
    for co in correct_options {
        correct_map.entry(co.question_id).or_default().insert(co.id);
    }

    let question_tags = QuestionTagRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT question_id, tag_id FROM exam_question_tags WHERE question_id = ANY($1)",
        vec![q_array],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut q_tag_map: HashMap<Uuid, Vec<Uuid>> = HashMap::new();
    for qt in question_tags {
        q_tag_map.entry(qt.question_id).or_default().push(qt.tag_id);
    }

    let mut total_correct: i32 = 0;
    let mut total_wrong: i32 = 0;
    let mut total_skipped: i32 = 0;
    let mut earned_points: f64 = 0.0;
    let mut max_points: f64 = 0.0;
    let total_questions = student_answers.len();

    let mut subject_stats: HashMap<Uuid, StatBucket> = HashMap::new();
    let mut tag_stats: HashMap<Uuid, StatBucket> = HashMap::new();
    let mut answer_updates: Vec<(Uuid, Option<bool>)> = Vec::with_capacity(total_questions);

    for ans in &student_answers {
        let text_empty = ans
            .text_answer
            .as_ref()
            .and_then(|v| v.as_array())
            .map(|a| a.is_empty())
            .unwrap_or(true);
        let is_skipped = ans.selected_option_id.is_none() && text_empty;
        let is_correct = if is_skipped {
            false
        } else if let Some(sel) = ans.selected_option_id {
            correct_map
                .get(&ans.question_id)
                .map(|set| set.contains(&sel))
                .unwrap_or(false)
        } else {
            false
        };
        let is_wrong = !is_skipped && !is_correct;

        if is_correct {
            total_correct += 1;
        } else if is_wrong {
            total_wrong += 1;
        } else {
            total_skipped += 1;
        }

        earned_points += ans.earned_score.unwrap_or(0.0);
        max_points += ans.max_score.unwrap_or(0.0);

        let s_bucket = subject_stats.entry(ans.subject_id).or_default();
        s_bucket.total += 1;
        if is_correct {
            s_bucket.correct += 1;
        } else if is_wrong {
            s_bucket.wrong += 1;
        } else {
            s_bucket.skipped += 1;
        }

        if let Some(tags) = q_tag_map.get(&ans.question_id) {
            for tid in tags {
                let t_bucket = tag_stats.entry(*tid).or_default();
                t_bucket.total += 1;
                if is_correct {
                    t_bucket.correct += 1;
                } else if is_wrong {
                    t_bucket.wrong += 1;
                } else {
                    t_bucket.skipped += 1;
                }
            }
        }

        answer_updates.push((ans.id, if is_skipped { None } else { Some(is_correct) }));
    }

    let final_score = if max_points > 0.0 {
        (earned_points / max_points) * 100.0
    } else {
        0.0
    };
    let answered_count = (total_questions as i32) - total_skipped;

    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    for (ans_id, is_corr) in answer_updates {
        txn.execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "UPDATE exam_session_answers SET is_correct = $1, updated_at = NOW() WHERE id = $2",
            vec![
                Value::Bool(is_corr),
                Value::Uuid(Some(Box::new(ans_id))),
            ],
        ))
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;
    }

    txn.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        INSERT INTO exam_user_stats_global (
            user_id, total_exams_taken, total_questions_answered,
            total_correct_answers, total_wrong_answers, average_score,
            last_active_at, updated_at
        )
        VALUES ($1, 1, $2, $3, $4, $5::numeric, NOW(), NOW())
        ON CONFLICT (user_id) DO UPDATE SET
            total_exams_taken = exam_user_stats_global.total_exams_taken + 1,
            total_questions_answered = exam_user_stats_global.total_questions_answered + EXCLUDED.total_questions_answered,
            total_correct_answers = exam_user_stats_global.total_correct_answers + EXCLUDED.total_correct_answers,
            total_wrong_answers = exam_user_stats_global.total_wrong_answers + EXCLUDED.total_wrong_answers,
            average_score = (exam_user_stats_global.average_score * exam_user_stats_global.total_exams_taken + $5::numeric) / (exam_user_stats_global.total_exams_taken + 1),
            last_active_at = NOW(),
            updated_at = NOW()
        "#,
        vec![
            Value::Uuid(Some(Box::new(user_id))),
            Value::Int(Some(answered_count)),
            Value::Int(Some(total_correct)),
            Value::Int(Some(total_wrong)),
            Value::Double(Some(final_score)),
        ],
    ))
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    for (s_id, s_stat) in subject_stats {
        let s_answered = s_stat.total - s_stat.skipped;
        let s_acc = if s_answered > 0 {
            (s_stat.correct as f64 / s_answered as f64) * 100.0
        } else {
            0.0
        };
        txn.execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO exam_user_stats_subject (
                id, user_id, subject_id, total_questions_answered,
                total_correct, total_wrong, accuracy_rate, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::numeric, NOW())
            ON CONFLICT (user_id, subject_id) DO UPDATE SET
                total_questions_answered = exam_user_stats_subject.total_questions_answered + $4,
                total_correct = exam_user_stats_subject.total_correct + $5,
                total_wrong = exam_user_stats_subject.total_wrong + $6,
                accuracy_rate = CASE
                    WHEN (exam_user_stats_subject.total_questions_answered + $4) > 0
                    THEN ((exam_user_stats_subject.total_correct + $5)::numeric / (exam_user_stats_subject.total_questions_answered + $4)) * 100
                    ELSE 0
                END,
                updated_at = NOW()
            "#,
            vec![
                Value::Uuid(Some(Box::new(Uuid::new_v4()))),
                Value::Uuid(Some(Box::new(user_id))),
                Value::Uuid(Some(Box::new(s_id))),
                Value::Int(Some(s_answered)),
                Value::Int(Some(s_stat.correct)),
                Value::Int(Some(s_stat.wrong)),
                Value::Double(Some(s_acc)),
            ],
        ))
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;
    }

    for (t_id, t_stat) in tag_stats {
        let t_answered = t_stat.total - t_stat.skipped;
        let t_acc = if t_answered > 0 {
            (t_stat.correct as f64 / t_answered as f64) * 100.0
        } else {
            0.0
        };
        txn.execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO exam_user_stats_tag (
                id, user_id, tag_id, total_questions_answered,
                total_correct, total_wrong, accuracy_rate, updated_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7::numeric, NOW())
            ON CONFLICT (user_id, tag_id) DO UPDATE SET
                total_questions_answered = exam_user_stats_tag.total_questions_answered + $4,
                total_correct = exam_user_stats_tag.total_correct + $5,
                total_wrong = exam_user_stats_tag.total_wrong + $6,
                accuracy_rate = CASE
                    WHEN (exam_user_stats_tag.total_questions_answered + $4) > 0
                    THEN ((exam_user_stats_tag.total_correct + $5)::numeric / (exam_user_stats_tag.total_questions_answered + $4)) * 100
                    ELSE 0
                END,
                updated_at = NOW()
            "#,
            vec![
                Value::Uuid(Some(Box::new(Uuid::new_v4()))),
                Value::Uuid(Some(Box::new(user_id))),
                Value::Uuid(Some(Box::new(t_id))),
                Value::Int(Some(t_answered)),
                Value::Int(Some(t_stat.correct)),
                Value::Int(Some(t_stat.wrong)),
                Value::Double(Some(t_acc)),
            ],
        ))
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;
    }

    txn.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        UPDATE exam_sessions
        SET status = 'completed',
            end_time = NOW(),
            earned_points = $1::numeric,
            max_points = $2::numeric,
            score = $3::numeric,
            total_correct = $4,
            total_wrong = $5,
            total_skipped = $6,
            updated_at = NOW()
        WHERE id = $7
        "#,
        vec![
            Value::Double(Some(earned_points)),
            Value::Double(Some(max_points)),
            Value::Double(Some(final_score)),
            Value::Int(Some(total_correct)),
            Value::Int(Some(total_wrong)),
            Value::Int(Some(total_skipped)),
            Value::Uuid(Some(Box::new(session_id))),
        ],
    ))
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let completed_count = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT COUNT(DISTINCT section_id) AS count
        FROM exam_sessions
        WHERE user_id = $1 AND package_id = $2 AND status = 'completed'
        "#,
        vec![
            Value::Uuid(Some(Box::new(user_id))),
            Value::Uuid(Some(Box::new(session.package_id))),
        ],
    ))
    .one(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map(|r| r.count as i32)
    .unwrap_or(0);

    let pkg_total = PkgTotalSectionsRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT total_sections FROM exam_packages WHERE id = $1 LIMIT 1",
        vec![Value::Uuid(Some(Box::new(session.package_id)))],
    ))
    .one(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map(|r| r.total_sections)
    .unwrap_or(0);

    let pkg_status = if pkg_total > 0 && completed_count >= pkg_total {
        "completed"
    } else {
        "in_progress"
    };

    txn.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        INSERT INTO exam_package_interactions (
            user_id, package_id, status, completed_sections_count, updated_at
        )
        VALUES ($1, $2, $3::exam_package_user_status, $4, NOW())
        ON CONFLICT (user_id, package_id) DO UPDATE SET
            status = $3::exam_package_user_status,
            completed_sections_count = $4,
            updated_at = NOW()
        "#,
        vec![
            Value::Uuid(Some(Box::new(user_id))),
            Value::Uuid(Some(Box::new(session.package_id))),
            Value::String(Some(Box::new(pkg_status.to_string()))),
            Value::Int(Some(completed_count)),
        ],
    ))
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(SubmitSessionData {
        score: final_score,
        earned_points,
        max_points,
        total_correct,
        total_wrong,
        total_skipped,
        total_questions,
    })
}
