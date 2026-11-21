use crate::app::AppState;
use crate::db::entities::course_lectures;
use crate::error::AppError;
use crate::modules::course::types::LectureItem;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use uuid::Uuid;

pub async fn list_lectures(
    state: &AppState,
    chapter_id: Uuid,
) -> Result<Vec<LectureItem>, AppError> {
    let rows = course_lectures::Entity::find()
        .filter(course_lectures::Column::ChapterId.eq(chapter_id))
        .order_by_asc(course_lectures::Column::Position)
        .all(&state.db)
        .await?;

    Ok(rows
        .into_iter()
        .map(|l| LectureItem {
            id: l.id,
            title: l.title,
            description: l.description,
            chapter_id: l.chapter_id,
            created_by_user_id: l.created_by_user_id,
            r#type: l.r#type.as_str().to_string(),
            reference_url: l.reference_url,
            extra: l.extra.unwrap_or_else(|| serde_json::json!({})),
            is_active: l.is_active,
            position: l.position.to_string(),
            created_at: l.created_at.and_utc().to_rfc3339(),
            updated_at: l.updated_at.and_utc().to_rfc3339(),
        })
        .collect())
}
