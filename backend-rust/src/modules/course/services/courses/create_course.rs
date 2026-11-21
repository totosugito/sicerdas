use crate::app::AppState;
use crate::db::entities::courses;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{AdminCreateCourseBody, CourseItem};
use crate::modules::course::utils::{
    get_course_thumbnail_url, parse_content_status, parse_publish_date_type,
};
use chrono::{DateTime, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn create_course(
    state: &AppState,
    lang: Lang,
    created_by_user_id: Uuid,
    input: AdminCreateCourseBody,
) -> Result<CourseItem, AppError> {
    let existing = courses::Entity::find()
        .filter(courses::Column::CourseCode.eq(&input.course_code))
        .one(&state.db)
        .await?;

    if existing.is_some() {
        return Err(AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::CourseCoursesCreateDuplicateCode,
        )));
    }

    let now = Utc::now().naive_utc();
    let publish_start = input
        .publish_date_start
        .as_deref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
        .map(|d| d.naive_utc());
    let publish_end = input
        .publish_date_end
        .as_deref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
        .map(|d| d.naive_utc());

    let status = parse_content_status(input.status.as_deref().unwrap_or("draft"));
    let publish_date_type =
        parse_publish_date_type(input.publish_date_type.as_deref().unwrap_or("now"));

    let active = courses::ActiveModel {
        id: Set(Uuid::new_v4()),
        created_by_user_id: Set(Some(created_by_user_id)),
        course_code: Set(input.course_code),
        course_name: Set(input.course_name),
        course_description: Set(input.course_description),
        what_you_will_learn: Set(input.what_you_will_learn),
        price: Set(Some(input.price.unwrap_or(0))),
        thumbnail: Set(None),
        category_id: Set(input.category_id),
        education_grade_id: Set(input.education_grade_id),
        tags: Set(input.tags),
        instructions: Set(input.instructions),
        status: Set(Some(status)),
        publish_date_type: Set(Some(publish_date_type)),
        publish_date_start: Set(publish_start),
        publish_date_end: Set(publish_end),
        is_public: Set(input.is_public.unwrap_or(false)),
        is_sequential: Set(input.is_sequential.unwrap_or(true)),
        total_chapters: Set(0),
        active_chapters: Set(0),
        total_lectures: Set(0),
        active_lectures: Set(0),
        version_id: Set(Some(input.version_id)),
        extra: Set(Some(serde_json::json!({}))),
        created_at: Set(now),
        updated_at: Set(now),
        deleted_at: Set(None),
    };

    let created = active.insert(&state.db).await?;

    Ok(CourseItem {
        id: created.id,
        created_by_user_id: created.created_by_user_id,
        course_code: created.course_code,
        course_name: created.course_name,
        course_description: created.course_description,
        what_you_will_learn: created.what_you_will_learn,
        price: created.price.unwrap_or(0),
        thumbnail: get_course_thumbnail_url(state, created.thumbnail.as_deref()),
        category_id: created.category_id,
        education_grade_id: Some(created.education_grade_id),
        tags: Some(created.tags.unwrap_or_default()),
        instructions: created.instructions,
        status: created
            .status
            .map(|s| s.as_str().to_string())
            .unwrap_or_else(|| "draft".to_string()),
        publish_date_type: created
            .publish_date_type
            .map(|p| p.as_str().to_string())
            .unwrap_or_else(|| "now".to_string()),
        publish_date_start: created.publish_date_start.map(|d| d.and_utc().to_rfc3339()),
        publish_date_end: created.publish_date_end.map(|d| d.and_utc().to_rfc3339()),
        is_public: created.is_public,
        is_sequential: created.is_sequential,
        version_id: created.version_id,
        extra: created.extra.unwrap_or_else(|| serde_json::json!({})),
        created_at: created.created_at.and_utc().to_rfc3339(),
        updated_at: created.updated_at.and_utc().to_rfc3339(),
        category: None,
        grade: None,
        total_chapters: None,
        total_lectures: None,
        enrolled_count: None,
        total_ratings: None,
        average_rating: None,
        progress: None,
    })
}
