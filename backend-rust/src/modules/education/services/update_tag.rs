use crate::app::AppState;
use crate::db::entities::education_tags;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::types::{TagData, UpdateTagBody};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, QueryFilter, Set, Statement};
use uuid::Uuid;

pub async fn update_tag(
    state: &AppState,
    id: Uuid,
    body: UpdateTagBody,
    locale: RequestLocale,
) -> Result<TagData, AppError> {
    let existing = education_tags::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::EducationTagsUpdateNotFound)))?;

    if let Some(ref name) = body.name {
        let trimmed = name.trim();
        if trimmed != existing.name {
            let dup = education_tags::Entity::find()
                .filter(education_tags::Column::Name.eq(trimmed))
                .filter(education_tags::Column::Id.ne(id))
                .one(&state.db)
                .await?;
            if dup.is_some() {
                return Err(AppError::BadRequest(
                    locale.t(LocaleKey::EducationTagsUpdateExists),
                ));
            }
        }
    }

    let mut active: education_tags::ActiveModel = existing.into();
    if let Some(name) = body.name {
        active.name = Set(name.trim().to_string());
    }
    if let Some(desc) = body.description {
        active.description = Set(Some(desc));
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    active.updated_at = Set(Utc::now().fixed_offset());

    let updated = active.update(&state.db).await?;
    let row = state
        .db
        .query_one(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "SELECT COUNT(*)::bigint AS cnt FROM exam_question_tags WHERE tag_id = $1",
            [id.into()],
        ))
        .await?;
    let total_questions: i64 = row.and_then(|r| r.try_get("", "cnt").ok()).unwrap_or(0);

    Ok(TagData {
        id: updated.id,
        name: updated.name,
        description: updated.description,
        is_active: updated.is_active,
        total_questions,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
    })
}
