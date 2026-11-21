use crate::app::AppState;
use crate::db::entities::course_lecture_texts;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{AdminUpdateLectureTextBody, LectureTextItem};
use crate::modules::course::utils::parse_content_status;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use uuid::Uuid;

pub async fn update_lecture_text(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    input: AdminUpdateLectureTextBody,
) -> Result<LectureTextItem, AppError> {
    let existing = course_lecture_texts::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::CourseLectureTextsNotFound,
            ))
        })?;

    let mut active: course_lecture_texts::ActiveModel = existing.into();
    if let Some(title) = input.title {
        active.title = Set(Some(title));
    }
    if let Some(content) = input.content {
        active.content = Set(content);
    }
    if let Some(cid) = input.category_id {
        active.category_id = Set(cid);
    }
    if let Some(gid) = input.education_grade_id {
        active.education_grade_id = Set(gid);
    }
    if let Some(status) = input.status {
        active.status = Set(parse_content_status(&status));
    }
    active.updated_at = Set(Utc::now().into());

    let updated = active.update(&state.db).await?;

    Ok(LectureTextItem {
        id: updated.id,
        title: updated.title,
        content: updated.content,
        category_id: updated.category_id,
        education_grade_id: updated.education_grade_id,
        status: updated.status.as_str().to_string(),
        created_by_user_id: updated.created_by_user_id,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
        category: None,
        grade: None,
    })
}
