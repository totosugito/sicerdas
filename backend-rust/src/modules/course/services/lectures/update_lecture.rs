use crate::app::AppState;
use crate::db::entities::course_lectures;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{AdminUpdateLectureBody, LectureItem};
use crate::modules::course::utils::{parse_lecture_type, recalculate_chapter_lecture_stats};
use chrono::Utc;
use rust_decimal::Decimal;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use std::str::FromStr;
use uuid::Uuid;

pub async fn update_lecture(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    input: AdminUpdateLectureBody,
) -> Result<LectureItem, AppError> {
    let existing = course_lectures::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseLecturesNotFound))
        })?;

    let chapter_id = existing.chapter_id;
    let is_active_changed = input.is_active.is_some();

    let mut active: course_lectures::ActiveModel = existing.into();
    if let Some(title) = input.title {
        active.title = Set(Some(title));
    }
    if let Some(desc) = input.description {
        active.description = Set(Some(desc));
    }
    if let Some(t) = input.r#type {
        active.r#type = Set(parse_lecture_type(&t));
    }
    if let Some(ref_url) = input.reference_url {
        active.reference_url = Set(Some(ref_url));
    }
    if let Some(extra) = input.extra {
        active.extra = Set(Some(extra));
    }
    if let Some(pos) = input.position.as_deref().and_then(|s| Decimal::from_str(s).ok()) {
        active.position = Set(pos);
    }
    if let Some(is_active) = input.is_active {
        active.is_active = Set(is_active);
    }
    active.updated_at = Set(Utc::now().naive_utc());

    let updated = active.update(&state.db).await?;
    if is_active_changed {
        let _ = recalculate_chapter_lecture_stats(state, chapter_id, None).await;
    }

    Ok(LectureItem {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        chapter_id: updated.chapter_id,
        created_by_user_id: updated.created_by_user_id,
        r#type: updated.r#type.as_str().to_string(),
        reference_url: updated.reference_url,
        extra: updated.extra.unwrap_or_else(|| serde_json::json!({})),
        is_active: updated.is_active,
        position: updated.position.to_string(),
        created_at: updated.created_at.and_utc().to_rfc3339(),
        updated_at: updated.updated_at.and_utc().to_rfc3339(),
    })
}
