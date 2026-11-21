use crate::app::AppState;
use crate::db::entities::course_lecture_texts;
use crate::error::AppError;
use crate::modules::course::types::{AdminCreateLectureTextBody, LectureTextItem};
use crate::modules::course::utils::parse_content_status;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, Set};
use uuid::Uuid;

pub async fn create_lecture_text(
    state: &AppState,
    created_by_user_id: Uuid,
    input: AdminCreateLectureTextBody,
) -> Result<LectureTextItem, AppError> {
    let now = Utc::now();
    let status = parse_content_status(input.status.as_deref().unwrap_or("draft"));
    let content = input.content.unwrap_or_else(|| serde_json::json!([]));

    let active = course_lecture_texts::ActiveModel {
        id: Set(Uuid::new_v4()),
        title: Set(input.title),
        content: Set(content),
        category_id: Set(input.category_id),
        education_grade_id: Set(input.education_grade_id),
        status: Set(status),
        created_by_user_id: Set(Some(created_by_user_id)),
        created_at: Set(now.into()),
        updated_at: Set(now.into()),
    };

    let created = active.insert(&state.db).await?;

    Ok(LectureTextItem {
        id: created.id,
        title: created.title,
        content: created.content,
        category_id: created.category_id,
        education_grade_id: created.education_grade_id,
        status: created.status.as_str().to_string(),
        created_by_user_id: created.created_by_user_id,
        created_at: created.created_at.to_rfc3339(),
        updated_at: created.updated_at.to_rfc3339(),
        category: None,
        grade: None,
    })
}
