use crate::app::AppState;
use crate::db::entities::course_enrollments::{self, EnrollmentStatus};
use crate::db::entities::courses;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::EnrollmentItem;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, QueryFilter, Set,
    Statement,
};
use uuid::Uuid;

pub async fn enroll_course(
    state: &AppState,
    lang: Lang,
    course_id: Uuid,
    user_id: Uuid,
) -> Result<EnrollmentItem, AppError> {
    let course = courses::Entity::find_by_id(course_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseCoursesNotFound))
        })?;

    if let Some(existing) = course_enrollments::Entity::find()
        .filter(course_enrollments::Column::CourseId.eq(course_id))
        .filter(course_enrollments::Column::UserId.eq(user_id))
        .one(&state.db)
        .await?
    {
        return Ok(EnrollmentItem {
            id: existing.id,
            course_id: existing.course_id,
            user_id: existing.user_id,
            status: existing.status.as_str().to_string(),
            enrolled_at: existing.enrolled_at.and_utc().to_rfc3339(),
            completed_at: existing.completed_at.map(|d| d.and_utc().to_rfc3339()),
        });
    }

    let now = Utc::now().naive_utc();
    let active = course_enrollments::ActiveModel {
        id: Set(Uuid::new_v4()),
        course_id: Set(course_id),
        user_id: Set(user_id),
        enrolled_at: Set(now),
        status: Set(EnrollmentStatus::Active),
        completed_at: Set(None),
        liked: Set(Some(false)),
        disliked: Set(Some(false)),
        rating: Set(None),
        bookmarked: Set(Some(false)),
        view_count: Set(Some(0)),
        extra: Set(Some(serde_json::json!({}))),
    };
    let created = active.insert(&state.db).await?;

    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO course_user_stats_category (id, user_id, category_id, courses_enrolled, courses_completed, updated_at)
            VALUES ($1, $2, $3, 1, 0, NOW())
            ON CONFLICT (user_id, category_id) DO UPDATE
            SET courses_enrolled = course_user_stats_category.courses_enrolled + 1,
                updated_at = NOW()
            "#,
            vec![Uuid::new_v4().into(), user_id.into(), course.category_id.into()],
        ))
        .await?;

    Ok(EnrollmentItem {
        id: created.id,
        course_id: created.course_id,
        user_id: created.user_id,
        status: created.status.as_str().to_string(),
        enrolled_at: created.enrolled_at.and_utc().to_rfc3339(),
        completed_at: created.completed_at.map(|d| d.and_utc().to_rfc3339()),
    })
}
