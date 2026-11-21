use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{
    CourseCategoryRef, CourseGradeRef, CourseItem, CourseUserDetail, CourseUserDetailProgress,
};
use crate::modules::course::utils::get_course_thumbnail_url;
use chrono::NaiveDateTime;
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use serde_json::Value as JsonValue;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct AdminCourseDetailRow {
    id: Uuid,
    created_by_user_id: Option<Uuid>,
    course_code: String,
    course_name: String,
    course_description: Option<String>,
    what_you_will_learn: Option<String>,
    price: Option<i32>,
    thumbnail: Option<String>,
    category_id: Uuid,
    education_grade_id: i32,
    tags: Option<Vec<String>>,
    instructions: Option<String>,
    status: Option<String>,
    publish_date_type: Option<String>,
    publish_date_start: Option<NaiveDateTime>,
    publish_date_end: Option<NaiveDateTime>,
    is_public: bool,
    is_sequential: bool,
    total_chapters: i32,
    total_lectures: i32,
    version_id: Option<i32>,
    extra: Option<JsonValue>,
    created_at: NaiveDateTime,
    updated_at: NaiveDateTime,
    cat_id: Option<Uuid>,
    cat_name: Option<String>,
    cat_key: Option<String>,
    grade_id: Option<i32>,
    grade_name: Option<String>,
    grade_val: Option<String>,
    total_students: Option<i32>,
    total_ratings: Option<i32>,
    rating_count: Option<i32>,
    average_rating: Option<f64>,
}

pub async fn admin_detail_course(
    state: &AppState,
    lang: Lang,
    id: Uuid,
) -> Result<CourseItem, AppError> {
    let r = AdminCourseDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            c.id,
            c.created_by_user_id,
            c.course_code,
            c.course_name,
            c.course_description,
            c.what_you_will_learn,
            c.price,
            c.thumbnail,
            c.category_id,
            c.education_grade_id,
            c.tags,
            c.instructions,
            c.status::text AS status,
            c.publish_date_type::text AS publish_date_type,
            c.publish_date_start,
            c.publish_date_end,
            c.is_public,
            c.is_sequential,
            c.total_chapters,
            c.total_lectures,
            c.version_id,
            c.extra,
            c.created_at,
            c.updated_at,
            ec.id AS cat_id,
            ec.name AS cat_name,
            ec.key AS cat_key,
            eg.id AS grade_id,
            eg.name AS grade_name,
            eg.grade AS grade_val,
            cs.total_students,
            cs.total_ratings,
            cs.rating_count,
            cs.average_rating::float8 AS average_rating
        FROM courses c
        LEFT JOIN education_categories ec ON c.category_id = ec.id
        LEFT JOIN education_grades eg ON c.education_grade_id = eg.id
        LEFT JOIN course_stats cs ON c.id = cs.course_id
        WHERE c.id = $1
        LIMIT 1
        "#,
        vec![id.into()],
    ))
    .one(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::CourseCoursesNotFound)))?;

    let r_count = r.rating_count.or(r.total_ratings).unwrap_or(0);
    let avg_rating = if r_count == 0 {
        5.0
    } else {
        r.average_rating.unwrap_or(5.0)
    };

    Ok(CourseItem {
        id: r.id,
        created_by_user_id: r.created_by_user_id,
        course_code: r.course_code,
        course_name: r.course_name,
        course_description: r.course_description,
        what_you_will_learn: r.what_you_will_learn,
        price: r.price.unwrap_or(0),
        thumbnail: get_course_thumbnail_url(state, r.thumbnail.as_deref()),
        category_id: r.category_id,
        education_grade_id: Some(r.education_grade_id),
        tags: Some(r.tags.unwrap_or_default()),
        instructions: r.instructions,
        status: r.status.unwrap_or_else(|| "draft".to_string()),
        publish_date_type: r.publish_date_type.unwrap_or_else(|| "now".to_string()),
        publish_date_start: r.publish_date_start.map(|d| d.and_utc().to_rfc3339()),
        publish_date_end: r.publish_date_end.map(|d| d.and_utc().to_rfc3339()),
        is_public: r.is_public,
        is_sequential: r.is_sequential,
        version_id: r.version_id,
        extra: r.extra.unwrap_or_else(|| serde_json::json!({})),
        created_at: r.created_at.and_utc().to_rfc3339(),
        updated_at: r.updated_at.and_utc().to_rfc3339(),
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
        total_chapters: Some(r.total_chapters),
        total_lectures: Some(r.total_lectures),
        enrolled_count: Some(r.total_students.unwrap_or(0)),
        total_ratings: Some(r_count),
        average_rating: Some(avg_rating),
        progress: None,
    })
}

#[derive(Debug, FromQueryResult)]
struct UserCourseDetailRow {
    id: Uuid,
    course_code: String,
    course_name: String,
    course_description: Option<String>,
    what_you_will_learn: Option<String>,
    price: Option<i32>,
    thumbnail: Option<String>,
    total_chapters: i32,
    total_lectures: i32,
    cat_id: Option<Uuid>,
    cat_name: Option<String>,
    cat_key: Option<String>,
    grade_id: Option<i32>,
    grade_name: Option<String>,
    grade_val: Option<String>,
    total_students: Option<i32>,
    total_ratings: Option<i32>,
    rating_count: Option<i32>,
    average_rating: Option<f64>,
    enrollment_status: Option<String>,
    completed_lectures: Option<i64>,
    user_rating: Option<f64>,
    bookmarked: Option<bool>,
}

pub async fn user_detail_course(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    user_id: Option<Uuid>,
) -> Result<CourseUserDetail, AppError> {
    let mut values: Vec<Value> = vec![id.into()];
    let (user_select, user_join) = if let Some(uid) = user_id {
        values.push(uid.into());
        (
            "ce.status::text AS enrollment_status, COALESCE(up.completed_lectures, 0)::bigint AS completed_lectures, ce.rating::float8 AS user_rating, ce.bookmarked",
            r#"
            LEFT JOIN course_enrollments ce ON c.id = ce.course_id AND ce.user_id = $2
            LEFT JOIN (
                SELECT course_id, COUNT(*) FILTER (WHERE is_completed = true) AS completed_lectures
                FROM course_user_progress
                WHERE user_id = $2
                GROUP BY course_id
            ) up ON c.id = up.course_id
            "#,
        )
    } else {
        (
            "NULL::text AS enrollment_status, NULL::bigint AS completed_lectures, NULL::float8 AS user_rating, NULL::boolean AS bookmarked",
            "",
        )
    };

    let sql = format!(
        r#"
        SELECT
            c.id,
            c.course_code,
            c.course_name,
            c.course_description,
            c.what_you_will_learn,
            c.price,
            c.thumbnail,
            c.total_chapters,
            c.total_lectures,
            ec.id AS cat_id,
            ec.name AS cat_name,
            ec.key AS cat_key,
            eg.id AS grade_id,
            eg.name AS grade_name,
            eg.grade AS grade_val,
            cs.total_students,
            cs.total_ratings,
            cs.rating_count,
            cs.average_rating::float8 AS average_rating,
            {user_select}
        FROM courses c
        LEFT JOIN education_categories ec ON c.category_id = ec.id
        LEFT JOIN education_grades eg ON c.education_grade_id = eg.id
        LEFT JOIN course_stats cs ON c.id = cs.course_id
        {user_join}
        WHERE c.id = $1 AND c.status = 'published'::status
        LIMIT 1
        "#
    );

    let r = UserCourseDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &sql,
        values,
    ))
    .one(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::CourseCoursesNotFound)))?;

    let r_count = r.total_ratings.or(r.rating_count).unwrap_or(0);
    let avg_rating = if r_count == 0 {
        5.0
    } else {
        r.average_rating.unwrap_or(5.0)
    };

    let progress = r.enrollment_status.map(|es| {
        let completed = r.completed_lectures.unwrap_or(0);
        let pct = if r.total_lectures > 0 {
            ((completed as f64 / r.total_lectures as f64) * 100.0).round() as i64
        } else {
            0
        };
        CourseUserDetailProgress {
            enrollment_status: es,
            completed_lectures: completed,
            progress_percentage: pct,
            rating: r.user_rating,
            bookmarked: r.bookmarked.unwrap_or(false),
        }
    });

    Ok(CourseUserDetail {
        id: r.id,
        course_code: r.course_code,
        course_name: r.course_name,
        course_description: r.course_description,
        what_you_will_learn: r.what_you_will_learn,
        price: r.price.unwrap_or(0),
        thumbnail: get_course_thumbnail_url(state, r.thumbnail.as_deref()),
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
        total_chapters: r.total_chapters,
        total_lectures: r.total_lectures,
        enrolled_count: r.total_students.unwrap_or(0),
        total_ratings: r_count,
        average_rating: avg_rating,
        progress,
    })
}
