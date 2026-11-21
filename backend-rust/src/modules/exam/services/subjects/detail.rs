use crate::app::AppState;
use crate::db::entities::exam::exam_subjects;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::SubjectItem;
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn detail_subject(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<SubjectItem, AppError> {
    let s = exam_subjects::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamSubjectsDetailNotFound,
            ))
        })?;

    Ok(SubjectItem {
        id: s.id,
        name: s.name,
        description: s.description,
        is_active: s.is_active,
        created_at: s.created_at.to_rfc3339(),
        updated_at: s.updated_at.to_rfc3339(),
    })
}
