use crate::app::AppState;
use crate::db::entities::course_chapters;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::ChapterItem;
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn detail_chapter(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<ChapterItem, AppError> {
    let ch = course_chapters::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseChaptersNotFound))
        })?;

    Ok(ChapterItem {
        id: ch.id,
        chapter_name: ch.chapter_name,
        course_id: ch.course_id,
        created_by_user_id: ch.created_by_user_id,
        extra: ch.extra.unwrap_or_else(|| serde_json::json!({})),
        is_active: ch.is_active,
        position: Some(ch.position),
        created_at: ch.created_at.and_utc().to_rfc3339(),
        updated_at: ch.updated_at.and_utc().to_rfc3339(),
        total_lectures: Some(ch.total_lectures),
    })
}
