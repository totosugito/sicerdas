use crate::app::AppState;
use crate::db::entities::courses;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{AdminUpdateCourseBody, CourseItem};
use crate::modules::course::utils::{
    get_course_thumbnail_url, parse_content_status, parse_publish_date_type,
};
use chrono::{DateTime, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn update_course(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    input: AdminUpdateCourseBody,
) -> Result<CourseItem, AppError> {
    let existing = courses::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::CourseCoursesNotFound)))?;

    if let Some(ref code) = input.course_code {
        if code != &existing.course_code {
            let conflict = courses::Entity::find()
                .filter(courses::Column::CourseCode.eq(code))
                .filter(courses::Column::Id.ne(id))
                .one(&state.db)
                .await?;
            if conflict.is_some() {
                return Err(AppError::BadRequest(locales::translate(
                    lang,
                    LocaleKey::CourseCoursesCreateDuplicateCode,
                )));
            }
        }
    }

    let mut active: courses::ActiveModel = existing.into();
    if let Some(v) = input.course_code {
        active.course_code = Set(v);
    }
    if let Some(v) = input.course_name {
        active.course_name = Set(v);
    }
    if let Some(v) = input.course_description {
        active.course_description = Set(Some(v));
    }
    if let Some(v) = input.what_you_will_learn {
        active.what_you_will_learn = Set(Some(v));
    }
    if let Some(v) = input.price {
        active.price = Set(Some(v));
    }
    if let Some(v) = input.thumbnail {
        active.thumbnail = Set(Some(v));
    }
    if let Some(v) = input.category_id {
        active.category_id = Set(v);
    }
    if let Some(v) = input.education_grade_id {
        active.education_grade_id = Set(v);
    }
    if let Some(v) = input.tags {
        active.tags = Set(Some(v));
    }
    if let Some(v) = input.instructions {
        active.instructions = Set(Some(v));
    }
    if let Some(v) = input.status {
        active.status = Set(Some(parse_content_status(&v)));
    }
    if let Some(v) = input.publish_date_type {
        active.publish_date_type = Set(Some(parse_publish_date_type(&v)));
    }
    if let Some(v) = input.publish_date_start {
        let dt = DateTime::parse_from_rfc3339(&v)
            .ok()
            .map(|d| d.naive_utc());
        active.publish_date_start = Set(dt);
    }
    if let Some(v) = input.publish_date_end {
        let dt = DateTime::parse_from_rfc3339(&v)
            .ok()
            .map(|d| d.naive_utc());
        active.publish_date_end = Set(dt);
    }
    if let Some(v) = input.is_public {
        active.is_public = Set(v);
    }
    if let Some(v) = input.is_sequential {
        active.is_sequential = Set(v);
    }
    if let Some(v) = input.version_id {
        active.version_id = Set(Some(v));
    }
    active.updated_at = Set(Utc::now().naive_utc());

    let updated = active.update(&state.db).await?;

    Ok(CourseItem {
        id: updated.id,
        created_by_user_id: updated.created_by_user_id,
        course_code: updated.course_code,
        course_name: updated.course_name,
        course_description: updated.course_description,
        what_you_will_learn: updated.what_you_will_learn,
        price: updated.price.unwrap_or(0),
        thumbnail: get_course_thumbnail_url(state, updated.thumbnail.as_deref()),
        category_id: updated.category_id,
        education_grade_id: Some(updated.education_grade_id),
        tags: Some(updated.tags.unwrap_or_default()),
        instructions: updated.instructions,
        status: updated
            .status
            .map(|s| s.as_str().to_string())
            .unwrap_or_else(|| "draft".to_string()),
        publish_date_type: updated
            .publish_date_type
            .map(|p| p.as_str().to_string())
            .unwrap_or_else(|| "now".to_string()),
        publish_date_start: updated.publish_date_start.map(|d| d.and_utc().to_rfc3339()),
        publish_date_end: updated.publish_date_end.map(|d| d.and_utc().to_rfc3339()),
        is_public: updated.is_public,
        is_sequential: updated.is_sequential,
        version_id: updated.version_id,
        extra: updated.extra.unwrap_or_else(|| serde_json::json!({})),
        created_at: updated.created_at.and_utc().to_rfc3339(),
        updated_at: updated.updated_at.and_utc().to_rfc3339(),
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
