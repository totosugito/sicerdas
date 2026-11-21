use crate::app::AppState;
use crate::db::entities::exam::{exam_passages, exam_subjects};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{CreatePassageBody, PassageItem};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn create_passage(
    state: &AppState,
    lang: Lang,
    created_by_user_id: Uuid,
    body: CreatePassageBody,
) -> Result<PassageItem, AppError> {
    let subject = exam_subjects::Entity::find_by_id(body.subject_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::BadRequest(locales::translate(
                lang,
                LocaleKey::ExamQuestionsCreateInvalidSubject,
            ))
        })?;

    let now = Utc::now();
    let content = body.content.unwrap_or_else(|| serde_json::json!([]));
    let active = exam_passages::ActiveModel {
        id: Set(Uuid::new_v4()),
        title: Set(body.title),
        subject_id: Set(body.subject_id),
        content: Set(content),
        created_by_user_id: Set(Some(created_by_user_id)),
        is_active: Set(body.is_active.unwrap_or(true)),
        total_questions: Set(0),
        active_questions: Set(0),
        created_at: Set(now.into()),
        updated_at: Set(now.into()),
    };

    let created = active.insert(&state.db).await?;
    Ok(PassageItem {
        id: created.id,
        title: created.title,
        content: created.content,
        is_active: created.is_active,
        created_at: created.created_at.to_rfc3339(),
        updated_at: created.updated_at.to_rfc3339(),
        subject_id: created.subject_id,
        total_questions: created.total_questions,
        active_questions: created.active_questions,
        subject_name: subject.name,
    })
}
