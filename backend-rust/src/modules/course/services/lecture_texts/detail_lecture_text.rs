use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{CourseCategoryRef, CourseGradeRef, LectureTextItem};
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct LectureTextDetailRow {
    id: Uuid,
    title: Option<String>,
    content: JsonValue,
    category_id: Option<Uuid>,
    education_grade_id: Option<i32>,
    status: String,
    created_by_user_id: Option<Uuid>,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    cat_id: Option<Uuid>,
    cat_name: Option<String>,
    cat_key: Option<String>,
    grade_id: Option<i32>,
    grade_name: Option<String>,
    grade_val: Option<String>,
}

pub async fn detail_lecture_text(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<LectureTextItem, AppError> {
    let r = LectureTextDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            lt.id,
            lt.title,
            lt.content,
            lt.category_id,
            lt.education_grade_id,
            lt.status::text AS status,
            lt.created_by_user_id,
            lt.created_at,
            lt.updated_at,
            ec.id AS cat_id,
            ec.name AS cat_name,
            ec.key AS cat_key,
            eg.id AS grade_id,
            eg.name AS grade_name,
            eg.grade AS grade_val
        FROM course_lecture_texts lt
        LEFT JOIN education_categories ec ON lt.category_id = ec.id
        LEFT JOIN education_grades eg ON lt.education_grade_id = eg.id
        WHERE lt.id = $1
        LIMIT 1
        "#,
        vec![id.into()],
    ))
    .one(&state.db)
    .await?
    .ok_or_else(|| {
        AppError::NotFound(locales::translate(
            lang,
            LocaleKey::CourseLectureTextsNotFound,
        ))
    })?;

    Ok(LectureTextItem {
        id: r.id,
        title: r.title,
        content: r.content,
        category_id: r.category_id,
        education_grade_id: r.education_grade_id,
        status: r.status,
        created_by_user_id: r.created_by_user_id,
        created_at: r.created_at.to_rfc3339(),
        updated_at: r.updated_at.to_rfc3339(),
        category: r.cat_id.map(|cid| CourseCategoryRef {
            id: cid,
            name: r.cat_name.unwrap_or_default(),
            key: r.cat_key.unwrap_or_default(),
        }),
        grade: r.grade_id.map(|gid| CourseGradeRef {
            id: gid,
            name: r.grade_name.unwrap_or_default(),
            grade: r.grade_val.unwrap_or_default(),
        }),
    })
}
