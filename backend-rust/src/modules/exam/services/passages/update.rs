use crate::app::AppState;
use crate::db::entities::exam::{exam_passages, exam_subjects};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{PassageItem, UpdatePassageBody};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn update_passage(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    body: UpdatePassageBody,
) -> Result<PassageItem, AppError> {
    let existing = exam_passages::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamPassagesUpdateNotFound,
            ))
        })?;

    let target_subject_id = body.subject_id.unwrap_or(existing.subject_id);
    let subject = exam_subjects::Entity::find_by_id(target_subject_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::BadRequest(locales::translate(
                lang,
                LocaleKey::ExamQuestionsCreateInvalidSubject,
            ))
        })?;

    let mut active: exam_passages::ActiveModel = existing.into();
    if let Some(title) = body.title {
        active.title = Set(Some(title));
    }
    if let Some(content) = body.content {
        active.content = Set(content);
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    if let Some(sid) = body.subject_id {
        active.subject_id = Set(sid);
    }
    active.updated_at = Set(Utc::now().into());

    let updated = active.update(&state.db).await?;
    Ok(PassageItem {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        is_active: updated.is_active,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
        subject_id: updated.subject_id,
        total_questions: updated.total_questions,
        active_questions: updated.active_questions,
        subject_name: subject.name,
    })
}
