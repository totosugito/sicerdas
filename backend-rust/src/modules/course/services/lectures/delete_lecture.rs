use crate::app::AppState;
use crate::db::entities::course_lectures;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::utils::recalculate_chapter_lecture_stats;
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_lecture(state: &AppState, lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = course_lectures::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseLecturesNotFound))
        })?;

    let chapter_id = existing.chapter_id;
    course_lectures::Entity::delete_by_id(id)
        .exec(&state.db)
        .await?;
    let _ = recalculate_chapter_lecture_stats(state, chapter_id, None).await;

    Ok(())
}
