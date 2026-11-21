use crate::app::AppState;
use crate::db::entities::course_lectures;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::LectureItem;
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn detail_lecture(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<LectureItem, AppError> {
    let l = course_lectures::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseLecturesNotFound))
        })?;

    Ok(LectureItem {
        id: l.id,
        title: l.title,
        description: l.description,
        chapter_id: l.chapter_id,
        created_by_user_id: l.created_by_user_id,
        r#type: l.r#type.as_str().to_string(),
        reference_url: l.reference_url,
        extra: l.extra.unwrap_or_else(|| serde_json::json!({})),
        is_active: l.is_active,
        position: l.position.to_string(),
        created_at: l.created_at.and_utc().to_rfc3339(),
        updated_at: l.updated_at.and_utc().to_rfc3339(),
    })
}
