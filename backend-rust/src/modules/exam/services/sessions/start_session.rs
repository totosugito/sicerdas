use crate::app::AppState;
use crate::db::entities::exam::enums::{ExamSessionMode, ExamSessionStatus};
use crate::db::entities::exam::{exam_session_answers, exam_sessions};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{StartSessionBody, StartSessionData};
use crate::modules::exam::utils::parse_session_mode;
use chrono::Utc;
use rand::seq::SliceRandom;
use rand::Rng;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DbBackend, EntityTrait, FromQueryResult, QueryFilter, Set,
    Statement, TransactionTrait, Value,
};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SectionCheckRow {
    question_limit: i32,
    is_random_item: bool,
    is_random_choice: bool,
}

#[derive(Debug, FromQueryResult)]
struct SectionQuestionRow {
    question_id: Uuid,
    variable_formulas: Option<JsonValue>,
}

#[derive(Debug, FromQueryResult)]
struct OptionRow {
    id: Uuid,
    question_id: Uuid,
}

pub async fn start_session(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: StartSessionBody,
) -> Result<StartSessionData, AppError> {
    let section = SectionCheckRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT eps.question_limit, eps.is_random_item, eps.is_random_choice
        FROM exam_package_sections eps
        INNER JOIN exam_packages ep ON ep.id = eps.package_id
        WHERE eps.id = $1
          AND eps.package_id = $2
          AND eps.is_active = true
          AND ep.is_active = true
          AND (
              ep.exam_type = 'official'
              OR ep.exam_type = 'course_exam'
              OR ep.created_by_user_id = $3
          )
        LIMIT 1
        "#,
        vec![
            Value::Uuid(Some(Box::new(body.section_id))),
            Value::Uuid(Some(Box::new(body.package_id))),
            Value::Uuid(Some(Box::new(user_id))),
        ],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesUpdateNotFound)))?;

    let mode = parse_session_mode(&body.mode);
    let existing = exam_sessions::Entity::find()
        .filter(exam_sessions::Column::UserId.eq(user_id))
        .filter(exam_sessions::Column::PackageId.eq(body.package_id))
        .filter(exam_sessions::Column::SectionId.eq(body.section_id))
        .filter(exam_sessions::Column::Mode.eq(mode.clone()))
        .filter(exam_sessions::Column::Status.eq(ExamSessionStatus::InProgress))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if let Some(sess) = existing {
        return Ok(StartSessionData {
            session_id: sess.id,
            is_resumed: true,
        });
    }

    let now = Utc::now().fixed_offset();
    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let new_session = exam_sessions::ActiveModel {
        id: Set(Uuid::new_v4()),
        user_id: Set(user_id),
        package_id: Set(body.package_id),
        section_id: Set(body.section_id),
        mode: Set(mode.clone()),
        is_timer_active: Set(mode == ExamSessionMode::Tryout),
        status: Set(ExamSessionStatus::InProgress),
        start_time: Set(now),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut questions_raw = SectionQuestionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT epq.question_id, eq.variable_formulas
        FROM exam_package_questions epq
        INNER JOIN exam_questions eq ON eq.id = epq.question_id
        WHERE epq.section_id = $1
        ORDER BY epq."order" ASC
        "#,
        vec![Value::Uuid(Some(Box::new(body.section_id)))],
    ))
    .all(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    if !questions_raw.is_empty() {
        {
            let mut rng = rand::thread_rng();
            if section.is_random_item {
                questions_raw.shuffle(&mut rng);
            }
        }

        let limit = section.question_limit as usize;
        if limit > 0 && limit < questions_raw.len() {
            questions_raw.truncate(limit);
        }

        let q_ids: Vec<Value> = questions_raw
            .iter()
            .map(|q| Value::Uuid(Some(Box::new(q.question_id))))
            .collect();

        let all_options = OptionRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            SELECT id, question_id
            FROM exam_question_options
            WHERE question_id = ANY($1)
            ORDER BY "order" ASC
            "#,
            vec![Value::Array(
                sea_orm::sea_query::ArrayType::Uuid,
                Some(Box::new(q_ids)),
            )],
        ))
        .all(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

        let answer_models: Vec<exam_session_answers::ActiveModel> = {
            let mut rng = rand::thread_rng();
            questions_raw
                .into_iter()
                .enumerate()
                .map(|(idx, q)| {
                    let mut opts: Vec<Uuid> = all_options
                        .iter()
                        .filter(|o| o.question_id == q.question_id)
                        .map(|o| o.id)
                        .collect();

                    if section.is_random_choice {
                        opts.shuffle(&mut rng);
                    }

                    let mut variation_index: i32 = 0;
                    if let Some(vars) = q
                        .variable_formulas
                        .as_ref()
                        .and_then(|vf| vf.get("variables"))
                        .and_then(|v| v.as_array())
                    {
                        if !vars.is_empty() {
                            variation_index = rng.gen_range(0..vars.len()) as i32;
                        }
                    }

                    exam_session_answers::ActiveModel {
                        id: Set(Uuid::new_v4()),
                        session_id: Set(new_session.id),
                        question_id: Set(q.question_id),
                        question_order: Set((idx + 1) as i32),
                        variation_index: Set(variation_index),
                        is_doubtful: Set(false),
                        shuffled_options_order: Set(Some(serde_json::json!(opts))),
                        created_at: Set(now),
                        updated_at: Set(now),
                        ..Default::default()
                    }
                })
                .collect()
        };

        exam_session_answers::Entity::insert_many(answer_models)
            .exec(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
    }

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(StartSessionData {
        session_id: new_session.id,
        is_resumed: false,
    })
}
