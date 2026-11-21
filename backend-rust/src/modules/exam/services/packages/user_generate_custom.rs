use crate::app::AppState;
use crate::db::entities::exam::enums::ExamType;
use crate::db::entities::exam::{exam_package_questions, exam_package_sections, exam_packages};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{GenerateCustomBody, GenerateCustomData};
use crate::modules::exam::utils::{sync_package, sync_section};
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, DbBackend, EntityTrait, FromQueryResult, Set, Statement, TransactionTrait,
    Value,
};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct QuestionIdRow {
    id: Uuid,
}

pub async fn user_generate_custom(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: GenerateCustomBody,
) -> Result<GenerateCustomData, AppError> {
    let limit = body.limit.unwrap_or(10).clamp(1, 100);
    let params: Vec<Value> = vec![
        Value::Int(Some(body.education_grade_id)),
        Value::Array(
            sea_orm::sea_query::ArrayType::Uuid,
            Some(Box::new(
                body.tag_ids
                    .iter()
                    .map(|id| Value::Uuid(Some(Box::new(*id))))
                    .collect(),
            )),
        ),
        Value::BigInt(Some(limit)),
    ];

    let selected = QuestionIdRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT q.id
        FROM exam_questions q
        INNER JOIN exam_question_tags qt ON qt.question_id = q.id
        WHERE q.is_active = true
          AND q.education_grade_id = $1
          AND qt.tag_id = ANY($2)
        ORDER BY RANDOM()
        LIMIT $3
        "#,
        params,
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    if selected.is_empty() {
        return Err(AppError::NotFound(translate(
            lang,
            LocaleKey::ExamPackagesGenerateCustomNoQuestions,
        )));
    }

    let now = Utc::now().fixed_offset();
    let total_questions = selected.len() as i32;
    let duration = total_questions * 2;
    let pkg_title = body
        .package_title
        .filter(|t| !t.trim().is_empty())
        .unwrap_or_else(|| format!("Latihan Kustom - {}", now.format("%d/%m/%Y")));
    let sec_title = body
        .section_title
        .filter(|t| !t.trim().is_empty())
        .unwrap_or_else(|| "Latihan Utama".to_string());

    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let new_pkg = exam_packages::ActiveModel {
        id: Set(Uuid::new_v4()),
        category_id: Set(body.category_id),
        education_grade_id: Set(Some(body.education_grade_id)),
        title: Set(pkg_title),
        exam_type: Set(ExamType::CustomPractice),
        created_by_user_id: Set(Some(user_id)),
        duration_minutes: Set(duration),
        required_tier: Set(Some("free".to_string())),
        is_active: Set(true),
        total_sections: Set(1),
        active_sections: Set(1),
        total_questions: Set(total_questions),
        active_questions: Set(total_questions),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let new_sec = exam_package_sections::ActiveModel {
        id: Set(Uuid::new_v4()),
        package_id: Set(new_pkg.id),
        title: Set(sec_title),
        duration_minutes: Set(duration),
        order: Set(1),
        is_active: Set(true),
        created_by_user_id: Set(Some(user_id)),
        is_random_item: Set(true),
        is_random_choice: Set(true),
        total_questions: Set(total_questions),
        active_questions: Set(total_questions),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    }
    .insert(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let mappings: Vec<exam_package_questions::ActiveModel> = selected
        .into_iter()
        .enumerate()
        .map(|(idx, row)| exam_package_questions::ActiveModel {
            package_id: Set(new_pkg.id),
            section_id: Set(new_sec.id),
            question_id: Set(row.id),
            order: Set((idx + 1) as i32),
        })
        .collect();

    exam_package_questions::Entity::insert_many(mappings)
        .exec(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    sync_section(&txn, new_sec.id).await?;
    sync_package(&txn, new_pkg.id).await?;

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(GenerateCustomData {
        package_id: new_pkg.id,
        section_id: new_sec.id,
    })
}
