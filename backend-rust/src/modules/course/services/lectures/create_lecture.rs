use crate::app::AppState;
use crate::db::entities::{course_chapters, course_lectures};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{AdminCreateLectureBody, LectureItem};
use crate::modules::course::utils::{parse_lecture_type, recalculate_chapter_lecture_stats};
use chrono::Utc;
use rust_decimal::Decimal;
use sea_orm::{ActiveModelTrait, DbBackend, EntityTrait, FromQueryResult, Set, Statement};
use std::str::FromStr;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct MaxPosRow {
    max_pos: Option<f64>,
}

pub async fn create_lecture(
    state: &AppState,
    lang: Lang,
    created_by_user_id: Uuid,
    input: AdminCreateLectureBody,
) -> Result<LectureItem, AppError> {
    let chapter = course_chapters::Entity::find_by_id(input.chapter_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseChaptersNotFound))
        })?;

    let pos_dec = match input.position.as_deref().and_then(|s| Decimal::from_str(s).ok()) {
        Some(d) => d,
        None => {
            let max_row = MaxPosRow::find_by_statement(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "SELECT COALESCE(MAX(position), 0)::float8 AS max_pos FROM course_lectures WHERE chapter_id = $1",
                vec![input.chapter_id.into()],
            ))
            .one(&state.db)
            .await?;
            let next_val = max_row.and_then(|r| r.max_pos).unwrap_or(0.0) + 1.0;
            Decimal::from_str(&format!("{:.4}", next_val)).unwrap_or(Decimal::ONE)
        }
    };

    let now = Utc::now().naive_utc();
    let lecture_type = parse_lecture_type(input.r#type.as_deref().unwrap_or("text"));

    let active = course_lectures::ActiveModel {
        id: Set(Uuid::new_v4()),
        title: Set(Some(input.title)),
        description: Set(input.description),
        chapter_id: Set(input.chapter_id),
        created_by_user_id: Set(Some(created_by_user_id)),
        r#type: Set(lecture_type),
        reference_url: Set(input.reference_url),
        extra: Set(Some(input.extra.unwrap_or_else(|| serde_json::json!({})))),
        is_active: Set(input.is_active.unwrap_or(true)),
        position: Set(pos_dec),
        created_at: Set(now),
        updated_at: Set(now),
    };

    let created = active.insert(&state.db).await?;
    let _ = recalculate_chapter_lecture_stats(state, input.chapter_id, Some(chapter.course_id)).await;

    Ok(LectureItem {
        id: created.id,
        title: created.title,
        description: created.description,
        chapter_id: created.chapter_id,
        created_by_user_id: created.created_by_user_id,
        r#type: created.r#type.as_str().to_string(),
        reference_url: created.reference_url,
        extra: created.extra.unwrap_or_else(|| serde_json::json!({})),
        is_active: created.is_active,
        position: created.position.to_string(),
        created_at: created.created_at.and_utc().to_rfc3339(),
        updated_at: created.updated_at.and_utc().to_rfc3339(),
    })
}
