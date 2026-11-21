use crate::app::AppState;
use crate::db::entities::{course_chapters, course_lectures};
use crate::error::AppError;
use crate::modules::course::types::{
    AdminCourseStructureChapter, LectureItem, PublicCourseStructureChapter,
    PublicCourseStructureLecture,
};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use uuid::Uuid;

pub async fn admin_structure_course(
    state: &AppState,
    course_id: Uuid,
) -> Result<Vec<AdminCourseStructureChapter>, AppError> {
    let chapters = course_chapters::Entity::find()
        .filter(course_chapters::Column::CourseId.eq(course_id))
        .order_by_asc(course_chapters::Column::Position)
        .all(&state.db)
        .await?;

    if chapters.is_empty() {
        return Ok(Vec::new());
    }

    let chapter_ids: Vec<Uuid> = chapters.iter().map(|c| c.id).collect();
    let lectures = course_lectures::Entity::find()
        .filter(course_lectures::Column::ChapterId.is_in(chapter_ids))
        .order_by_asc(course_lectures::Column::Position)
        .all(&state.db)
        .await?;

    Ok(chapters
        .into_iter()
        .map(|ch| {
            let ch_lectures = lectures
                .iter()
                .filter(|l| l.chapter_id == ch.id)
                .map(|l| LectureItem {
                    id: l.id,
                    title: l.title.clone(),
                    description: l.description.clone(),
                    chapter_id: l.chapter_id,
                    created_by_user_id: l.created_by_user_id,
                    r#type: l.r#type.as_str().to_string(),
                    reference_url: l.reference_url.clone(),
                    extra: l.extra.clone().unwrap_or_else(|| serde_json::json!({})),
                    is_active: l.is_active,
                    position: l.position.to_string(),
                    created_at: l.created_at.and_utc().to_rfc3339(),
                    updated_at: l.updated_at.and_utc().to_rfc3339(),
                })
                .collect();

            AdminCourseStructureChapter {
                id: ch.id,
                chapter_name: ch.chapter_name,
                course_id: ch.course_id,
                created_by_user_id: ch.created_by_user_id,
                extra: ch.extra.unwrap_or_else(|| serde_json::json!({})),
                is_active: ch.is_active,
                position: ch.position,
                total_lectures: ch.total_lectures,
                active_lectures: ch.active_lectures,
                created_at: ch.created_at.and_utc().to_rfc3339(),
                updated_at: ch.updated_at.and_utc().to_rfc3339(),
                lectures: ch_lectures,
            }
        })
        .collect())
}

pub async fn public_structure_course(
    state: &AppState,
    course_id: Uuid,
) -> Result<Vec<PublicCourseStructureChapter>, AppError> {
    let admin = admin_structure_course(state, course_id).await?;
    Ok(admin
        .into_iter()
        .map(|ch| PublicCourseStructureChapter {
            id: ch.id,
            chapter_name: ch.chapter_name,
            course_id: ch.course_id,
            position: Some(ch.position),
            lectures: ch
                .lectures
                .into_iter()
                .map(|l| PublicCourseStructureLecture {
                    id: l.id,
                    title: l.title,
                    description: l.description,
                    chapter_id: l.chapter_id,
                    r#type: l.r#type,
                    position: l.position,
                })
                .collect(),
        })
        .collect())
}
