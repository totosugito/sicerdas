use crate::app::AppState;
use crate::db::entities::app_version::ContentStatus;
use crate::db::entities::course_lectures::LectureType;
use crate::db::entities::courses::PublishDateType;
use crate::error::AppError;
use chrono::{Datelike, NaiveDateTime};
use sea_orm::{ConnectionTrait, DbBackend, Statement};
use uuid::Uuid;

pub fn get_course_thumbnail_url(state: &AppState, thumbnail_path: Option<&str>) -> Option<String> {
    let path = thumbnail_path?.trim();
    if path.is_empty() {
        return None;
    }
    if path.starts_with("http://") || path.starts_with("https://") {
        return Some(path.to_string());
    }
    Some(state.storage.public_url(path))
}

pub fn build_course_thumbnail_rel_path(
    course_id: Uuid,
    created_at: NaiveDateTime,
    filename: &str,
) -> String {
    format!(
        "course/{:04}-{:02}/{}/{}",
        created_at.year(),
        created_at.month(),
        course_id,
        filename
    )
}

pub fn parse_content_status(s: &str) -> ContentStatus {
    match s.to_lowercase().as_str() {
        "draft" => ContentStatus::Draft,
        "published" => ContentStatus::Published,
        "unpublished" => ContentStatus::Unpublished,
        "finished" => ContentStatus::Finished,
        "archived" => ContentStatus::Archived,
        "deleted" => ContentStatus::Deleted,
        _ => ContentStatus::Draft,
    }
}

pub fn parse_publish_date_type(s: &str) -> PublishDateType {
    match s.to_lowercase().as_str() {
        "date" => PublishDateType::Date,
        _ => PublishDateType::Now,
    }
}

pub fn parse_lecture_type(s: &str) -> LectureType {
    match s.to_lowercase().as_str() {
        "video" => LectureType::Video,
        "exam" => LectureType::Exam,
        "text" => LectureType::Text,
        "pdf" => LectureType::Pdf,
        "discussion" => LectureType::Discussion,
        _ => LectureType::Other,
    }
}

pub async fn recalculate_course_chapter_stats(
    state: &AppState,
    course_id: Uuid,
) -> Result<(), AppError> {
    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            UPDATE courses
            SET
                total_chapters = COALESCE((SELECT COUNT(*)::int FROM course_chapters WHERE course_id = $1), 0),
                active_chapters = COALESCE((SELECT COUNT(*)::int FROM course_chapters WHERE course_id = $1 AND is_active = true), 0),
                updated_at = NOW()
            WHERE id = $1
            "#,
            vec![course_id.into()],
        ))
        .await?;
    Ok(())
}

pub async fn recalculate_chapter_lecture_stats(
    state: &AppState,
    chapter_id: Uuid,
    course_id: Option<Uuid>,
) -> Result<(), AppError> {
    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            UPDATE course_chapters
            SET
                total_lectures = COALESCE((SELECT COUNT(*)::int FROM course_lectures WHERE chapter_id = $1), 0),
                active_lectures = COALESCE((SELECT COUNT(*)::int FROM course_lectures WHERE chapter_id = $1 AND is_active = true), 0),
                updated_at = NOW()
            WHERE id = $1
            "#,
            vec![chapter_id.into()],
        ))
        .await?;

    let target_course_id = if let Some(cid) = course_id {
        Some(cid)
    } else {
        use crate::db::entities::course_chapters;
        use sea_orm::EntityTrait;
        course_chapters::Entity::find_by_id(chapter_id)
            .one(&state.db)
            .await?
            .map(|c| c.course_id)
    };

    if let Some(cid) = target_course_id {
        state
            .db
            .execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                r#"
                UPDATE courses
                SET
                    total_lectures = COALESCE((
                        SELECT COUNT(*)::int
                        FROM course_lectures l
                        INNER JOIN course_chapters c ON l.chapter_id = c.id
                        WHERE c.course_id = $1
                    ), 0),
                    active_lectures = COALESCE((
                        SELECT COUNT(*)::int
                        FROM course_lectures l
                        INNER JOIN course_chapters c ON l.chapter_id = c.id
                        WHERE c.course_id = $1 AND l.is_active = true
                    ), 0),
                    updated_at = NOW()
                WHERE id = $1
                "#,
                vec![cid.into()],
            ))
            .await?;
    }

    Ok(())
}
