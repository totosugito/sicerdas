use crate::app::AppState;
use crate::db::entities::course_enrollments::EnrollmentStatus;
use crate::error::AppError;
use crate::modules::course::types::{UserCourseCourseRef, UserCourseItem};
use crate::modules::course::utils::get_course_thumbnail_url;
use crate::types::response::PaginationMeta;
use chrono::NaiveDateTime;
use sea_orm::{DbBackend, FromQueryResult, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct UserCourseRow {
    enrollment_id: Uuid,
    status: String,
    enrolled_at: NaiveDateTime,
    completed_at: Option<NaiveDateTime>,
    course_id: Uuid,
    course_code: String,
    course_name: String,
    course_description: Option<String>,
    thumbnail: Option<String>,
    price: Option<i32>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_user_courses(
    state: &AppState,
    user_id: Uuid,
    target_status: EnrollmentStatus,
    page: u64,
    limit: u64,
) -> Result<(Vec<UserCourseItem>, PaginationMeta), AppError> {
    let page = page.max(1);
    let limit = limit.clamp(1, 100);
    let offset = (page - 1) * limit;
    let status_str = target_status.as_str().to_string();

    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT COUNT(*)::bigint AS total
        FROM course_enrollments
        WHERE user_id = $1 AND status = $2::enrollment_status
        "#,
        vec![user_id.into(), status_str.clone().into()],
    ))
    .one(&state.db)
    .await?
    .map(|r| r.total.max(0) as u64)
    .unwrap_or(0);

    let total_pages = if total == 0 { 0 } else { total.div_ceil(limit) };

    let rows = UserCourseRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            ce.id AS enrollment_id,
            ce.status::text AS status,
            ce.enrolled_at,
            ce.completed_at,
            c.id AS course_id,
            c.course_code,
            c.course_name,
            c.course_description,
            c.thumbnail,
            c.price
        FROM course_enrollments ce
        INNER JOIN courses c ON ce.course_id = c.id
        WHERE ce.user_id = $1 AND ce.status = $2::enrollment_status
        ORDER BY ce.enrolled_at DESC
        LIMIT $3 OFFSET $4
        "#,
        vec![
            user_id.into(),
            status_str.into(),
            (limit as i64).into(),
            (offset as i64).into(),
        ],
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| UserCourseItem {
            enrollment_id: r.enrollment_id,
            status: r.status,
            enrolled_at: r.enrolled_at.and_utc().to_rfc3339(),
            completed_at: r.completed_at.map(|d| d.and_utc().to_rfc3339()),
            course: UserCourseCourseRef {
                id: r.course_id,
                course_code: r.course_code,
                course_name: r.course_name,
                course_description: r.course_description,
                thumbnail: get_course_thumbnail_url(state, r.thumbnail.as_deref()),
                price: r.price.unwrap_or(0),
            },
        })
        .collect();

    Ok((
        items,
        PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    ))
}
