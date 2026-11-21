use crate::app::AppState;
use crate::db::entities::{course_chapters, courses};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{AdminCreateChapterBody, ChapterItem};
use crate::modules::course::utils::recalculate_course_chapter_stats;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, DbBackend, EntityTrait, FromQueryResult, Set, Statement,
};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct MaxPosRow {
    max_pos: Option<String>,
}

pub async fn create_chapter(
    state: &AppState,
    lang: Lang,
    created_by_user_id: Uuid,
    input: AdminCreateChapterBody,
) -> Result<ChapterItem, AppError> {
    let course_exists = courses::Entity::find_by_id(input.course_id)
        .one(&state.db)
        .await?
        .is_some();
    if !course_exists {
        return Err(AppError::NotFound(locales::translate(
            lang,
            LocaleKey::CourseCoursesNotFound,
        )));
    }

    let position = match input.position.filter(|s| !s.is_empty()) {
        Some(p) => p,
        None => {
            let max_row = MaxPosRow::find_by_statement(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "SELECT COALESCE(MAX(position), '0') AS max_pos FROM course_chapters WHERE course_id = $1",
                vec![input.course_id.into()],
            ))
            .one(&state.db)
            .await?;

            let current_max: f64 = max_row
                .and_then(|r| r.max_pos)
                .and_then(|s| s.parse::<f64>().ok())
                .unwrap_or(0.0);
            let next_val = if current_max > 0.0 {
                current_max + 0.01
            } else {
                0.1
            };
            format!("{:.4}", next_val)
        }
    };

    let now = Utc::now().naive_utc();
    let active = course_chapters::ActiveModel {
        id: Set(Uuid::new_v4()),
        chapter_name: Set(Some(input.chapter_name)),
        course_id: Set(input.course_id),
        created_by_user_id: Set(Some(created_by_user_id)),
        extra: Set(Some(serde_json::json!({}))),
        is_active: Set(input.is_active.unwrap_or(true)),
        position: Set(position),
        total_lectures: Set(0),
        active_lectures: Set(0),
        created_at: Set(now),
        updated_at: Set(now),
    };

    let created = active.insert(&state.db).await?;
    let _ = recalculate_course_chapter_stats(state, input.course_id).await;

    Ok(ChapterItem {
        id: created.id,
        chapter_name: created.chapter_name,
        course_id: created.course_id,
        created_by_user_id: created.created_by_user_id,
        extra: created.extra.unwrap_or_else(|| serde_json::json!({})),
        is_active: created.is_active,
        position: Some(created.position),
        created_at: created.created_at.and_utc().to_rfc3339(),
        updated_at: created.updated_at.and_utc().to_rfc3339(),
        total_lectures: Some(created.total_lectures),
    })
}
