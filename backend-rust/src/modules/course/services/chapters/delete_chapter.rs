use crate::app::AppState;
use crate::db::entities::course_chapters;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::utils::recalculate_course_chapter_stats;
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_chapter(state: &AppState, lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = course_chapters::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseChaptersNotFound))
        })?;

    let course_id = existing.course_id;
    course_chapters::Entity::delete_by_id(id)
        .exec(&state.db)
        .await?;
    let _ = recalculate_course_chapter_stats(state, course_id).await;

    Ok(())
}
