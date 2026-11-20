use crate::app::AppState;
use crate::db::entities::education_grades;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::types::{CreateGradeBody, GradeData};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use serde_json::json;
use uuid::Uuid;

pub async fn create_grade(
    state: &AppState,
    user_id: Uuid,
    body: CreateGradeBody,
    locale: RequestLocale,
) -> Result<GradeData, AppError> {
    let grade = body.grade.trim().to_string();
    let name = body.name.trim().to_string();
    if grade.is_empty() || name.is_empty() {
        return Err(AppError::BadRequest(
            "Grade and name are required".to_string(),
        ));
    }

    let existing = education_grades::Entity::find()
        .filter(education_grades::Column::Grade.eq(&grade))
        .one(&state.db)
        .await?;
    if existing.is_some() {
        return Err(AppError::BadRequest(
            locale.t(LocaleKey::EducationGradesCreateExists),
        ));
    }

    let now = Utc::now().fixed_offset();
    let inserted = education_grades::ActiveModel {
        grade: Set(grade),
        name: Set(name),
        desc: Set(Some(body.desc.unwrap_or_default())),
        extra: Set(Some(body.extra.unwrap_or_else(|| json!({})))),
        created_by_user_id: Set(Some(user_id)),
        is_default: Set(Some(body.is_default.unwrap_or(true))),
        created_at: Set(Some(now)),
        updated_at: Set(Some(now)),
        ..Default::default()
    }
    .insert(&state.db)
    .await?;

    Ok(GradeData::from(inserted))
}
