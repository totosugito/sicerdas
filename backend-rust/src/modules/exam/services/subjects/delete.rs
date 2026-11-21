use crate::app::AppState;
use crate::db::entities::exam::exam_subjects;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_subject(state: &AppState, lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = exam_subjects::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamSubjectsDeleteNotFound,
            ))
        })?;

    exam_subjects::Entity::delete_by_id(existing.id)
        .exec(&state.db)
        .await
        .map_err(|_| {
            AppError::BadRequest(locales::translate(
                lang,
                LocaleKey::ExamSubjectsDeleteInUse,
            ))
        })?;

    Ok(())
}
