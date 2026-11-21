use crate::app::AppState;
use crate::db::entities::exam::exam_subjects;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{CreateSubjectBody, SubjectItem};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, DbBackend, FromQueryResult, Set, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
#[allow(dead_code)]
struct IdRow {
    id: Uuid,
}

pub async fn create_subject(
    state: &AppState,
    lang: Lang,
    created_by_user_id: Uuid,
    body: CreateSubjectBody,
) -> Result<SubjectItem, AppError> {
    let name = body.name.trim().to_string();
    let dup = IdRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT id FROM exam_subjects WHERE lower(name) = $1 LIMIT 1",
        vec![name.to_lowercase().into()],
    ))
    .one(&state.db)
    .await?;

    if dup.is_some() {
        return Err(AppError::Conflict(locales::translate(
            lang,
            LocaleKey::ExamSubjectsCreateExists,
        )));
    }

    let now = Utc::now();
    let active = exam_subjects::ActiveModel {
        id: Set(Uuid::new_v4()),
        name: Set(name),
        description: Set(body.description),
        created_by_user_id: Set(Some(created_by_user_id)),
        is_active: Set(body.is_active.unwrap_or(true)),
        created_at: Set(now.into()),
        updated_at: Set(now.into()),
    };

    let created = active.insert(&state.db).await?;
    Ok(SubjectItem {
        id: created.id,
        name: created.name,
        description: created.description,
        is_active: created.is_active,
        created_at: created.created_at.to_rfc3339(),
        updated_at: created.updated_at.to_rfc3339(),
    })
}
