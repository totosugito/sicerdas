use crate::app::AppState;
use crate::db::entities::education_tags;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::types::TagData;
use sea_orm::{ConnectionTrait, DbBackend, EntityTrait, Statement};
use uuid::Uuid;

pub async fn detail_tag(
    state: &AppState,
    id: Uuid,
    locale: RequestLocale,
) -> Result<TagData, AppError> {
    let tag = education_tags::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::EducationTagsDetailNotFound)))?;

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
        id: tag.id,
        name: tag.name,
        description: tag.description,
        is_active: tag.is_active,
        total_questions,
        created_at: tag.created_at.to_rfc3339(),
        updated_at: tag.updated_at.to_rfc3339(),
    })
}
