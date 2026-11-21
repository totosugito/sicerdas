use crate::app::AppState;
use crate::db::entities::exam::enums::ExamSessionStatus;
use crate::db::entities::exam::exam_sessions;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn abandon_session(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    session_id: Uuid,
) -> Result<Uuid, AppError> {
    let existing = exam_sessions::Entity::find_by_id(session_id)
        .filter(exam_sessions::Column::UserId.eq(user_id))
        .filter(exam_sessions::Column::Status.eq(ExamSessionStatus::InProgress))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsAbandonNotFound)))?;

    let mut active: exam_sessions::ActiveModel = existing.into();
    active.status = Set(ExamSessionStatus::Abandoned);
    active.updated_at = Set(Utc::now().fixed_offset());
    let updated = active
        .update(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(updated.id)
}
