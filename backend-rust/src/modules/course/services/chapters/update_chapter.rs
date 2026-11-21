use crate::app::AppState;
use crate::db::entities::course_chapters;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{AdminUpdateChapterBody, ChapterItem};
use crate::modules::course::utils::recalculate_course_chapter_stats;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn update_chapter(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    input: AdminUpdateChapterBody,
) -> Result<ChapterItem, AppError> {
    let existing = course_chapters::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseChaptersNotFound))
        })?;

    let course_id = existing.course_id;
    let is_active_changed = input.is_active.is_some();

    let mut active: course_chapters::ActiveModel = existing.into();
    if let Some(name) = input.chapter_name {
        active.chapter_name = Set(Some(name));
    }
    if let Some(pos) = input.position {
        active.position = Set(pos);
    }
    if let Some(is_active) = input.is_active {
        active.is_active = Set(is_active);
    }
    active.updated_at = Set(Utc::now().naive_utc());

    let updated = active.update(&state.db).await?;
    if is_active_changed {
        let _ = recalculate_course_chapter_stats(state, course_id).await;
    }

    Ok(ChapterItem {
        id: updated.id,
        chapter_name: updated.chapter_name,
        course_id: updated.course_id,
        created_by_user_id: updated.created_by_user_id,
        extra: updated.extra.unwrap_or_else(|| serde_json::json!({})),
        is_active: updated.is_active,
        position: Some(updated.position),
        created_at: updated.created_at.and_utc().to_rfc3339(),
        updated_at: updated.updated_at.and_utc().to_rfc3339(),
        total_lectures: Some(updated.total_lectures),
    })
}
