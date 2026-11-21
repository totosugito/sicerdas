use crate::app::AppState;
use crate::db::entities::course_lecture_texts;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_lecture_text(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<(), AppError> {
    let existing = course_lecture_texts::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::CourseLectureTextsNotFound,
            ))
        })?;

    course_lecture_texts::Entity::delete_by_id(existing.id)
        .exec(&state.db)
        .await?;

    Ok(())
}
