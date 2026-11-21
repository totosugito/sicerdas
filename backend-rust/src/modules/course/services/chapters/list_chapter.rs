use crate::app::AppState;
use crate::db::entities::course_chapters;
use crate::error::AppError;
use crate::modules::course::types::ChapterItem;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use uuid::Uuid;

pub async fn list_chapters(
    state: &AppState,
    course_id: Uuid,
) -> Result<Vec<ChapterItem>, AppError> {
    let rows = course_chapters::Entity::find()
        .filter(course_chapters::Column::CourseId.eq(course_id))
        .order_by_asc(course_chapters::Column::Position)
        .all(&state.db)
        .await?;

    Ok(rows
        .into_iter()
        .map(|ch| ChapterItem {
            id: ch.id,
            chapter_name: ch.chapter_name,
            course_id: ch.course_id,
            created_by_user_id: ch.created_by_user_id,
            extra: ch.extra.unwrap_or_else(|| serde_json::json!({})),
            is_active: ch.is_active,
            position: Some(ch.position),
            created_at: ch.created_at.and_utc().to_rfc3339(),
            updated_at: ch.updated_at.and_utc().to_rfc3339(),
            total_lectures: Some(ch.total_lectures),
        })
        .collect())
}
