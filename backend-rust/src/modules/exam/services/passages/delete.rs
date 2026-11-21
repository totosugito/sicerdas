use crate::app::AppState;
use crate::db::entities::exam::exam_passages;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_passage(state: &AppState, lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = exam_passages::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamPassagesDeleteNotFound,
            ))
        })?;

    let created_at = existing.created_at;
    exam_passages::Entity::delete_by_id(id)
        .exec(&state.db)
        .await?;

    let storage = state.storage.clone();
    let id_str = id.to_string();
    tokio::spawn(async move {
        storage
            .delete_storage_directory("passage", &id_str, created_at.into())
            .await;
    });

    Ok(())
}
