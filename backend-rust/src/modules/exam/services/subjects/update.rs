use crate::app::AppState;
use crate::db::entities::exam::exam_subjects;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{SubjectItem, UpdateSubjectBody};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, DbBackend, EntityTrait, FromQueryResult, Set, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct IdRow {
    id: Uuid,
}

pub async fn update_subject(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    body: UpdateSubjectBody,
) -> Result<SubjectItem, AppError> {
    let existing = exam_subjects::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamSubjectsUpdateNotFound,
            ))
        })?;

    if let Some(ref raw_name) = body.name {
        let trimmed = raw_name.trim().to_string();
        if trimmed.to_lowercase() != existing.name.to_lowercase() {
            let dup = IdRow::find_by_statement(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "SELECT id FROM exam_subjects WHERE lower(name) = $1 AND id != $2 LIMIT 1",
                vec![trimmed.to_lowercase().into(), id.into()],
            ))
            .one(&state.db)
            .await?;
            if dup.is_some() {
                return Err(AppError::Conflict(locales::translate(
                    lang,
                    LocaleKey::ExamSubjectsCreateExists,
                )));
            }
        }
    }

    let mut active: exam_subjects::ActiveModel = existing.into();
    if let Some(name) = body.name {
        active.name = Set(name.trim().to_string());
    }
    if let Some(desc) = body.description {
        active.description = Set(Some(desc));
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    active.updated_at = Set(Utc::now().into());

    let updated = active.update(&state.db).await?;
    Ok(SubjectItem {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        is_active: updated.is_active,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
    })
}
