use crate::app::AppState;
use crate::db::entities::courses;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn delete_course(state: &AppState, lang: Lang, id: Uuid) -> Result<(), AppError> {
    let existing = courses::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::CourseCoursesNotFound)))?;

    let created_at_utc = existing.created_at.and_utc();
    courses::Entity::delete_by_id(id).exec(&state.db).await?;

    let storage = state.storage.clone();
    let id_str = id.to_string();
    tokio::spawn(async move {
        storage
            .delete_storage_directory("course", &id_str, created_at_utc)
            .await;
    });

    Ok(())
}
