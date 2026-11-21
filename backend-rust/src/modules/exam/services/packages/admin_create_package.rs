use crate::app::AppState;
use crate::db::entities::education::{education_categories, education_grades};
use crate::db::entities::exam::enums::ExamType;
use crate::db::entities::exam::exam_packages;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::CreatePackageBody;
use crate::modules::exam::utils::parse_exam_type;
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ConnectionTrait, DbBackend, EntityTrait, Set, Statement, Value};
use uuid::Uuid;

pub async fn recalculate_exam_education_stats(
    state: &AppState,
    category_id: Uuid,
    grade_id: i32,
) {
    let _ = state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO education_category_grade_stats (
                category_id, education_grade_id, content_type, total_count, active_count, updated_at
            )
            SELECT
                $1,
                $2,
                'exam',
                (
                    SELECT COUNT(*)::int
                    FROM exam_packages
                    WHERE category_id = $1
                      AND education_grade_id = $2
                      AND exam_type = 'official'
                ),
                (
                    SELECT COUNT(*)::int
                    FROM exam_packages
                    WHERE category_id = $1
                      AND education_grade_id = $2
                      AND exam_type = 'official'
                      AND is_active = true
                      AND active_sections > 0
                      AND active_questions > 0
                ),
                NOW()
            ON CONFLICT (category_id, education_grade_id, content_type) DO UPDATE
            SET total_count = EXCLUDED.total_count,
                active_count = EXCLUDED.active_count,
                updated_at = NOW()
            "#,
            vec![
                Value::Uuid(Some(Box::new(category_id))),
                Value::Int(Some(grade_id)),
            ],
        ))
        .await;
}

pub async fn admin_create_package(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: CreatePackageBody,
) -> Result<Uuid, AppError> {
    if education_categories::Entity::find_by_id(body.category_id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .is_none()
    {
        return Err(AppError::NotFound(translate(
            lang,
            LocaleKey::EducationCategoriesUpdateNotFound,
        )));
    }

    if let Some(grade_id) = body.education_grade_id {
        if education_grades::Entity::find_by_id(grade_id)
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?
            .is_none()
        {
            return Err(AppError::NotFound(translate(
                lang,
                LocaleKey::EducationGradesUpdateNotFound,
            )));
        }
    }

    let now = Utc::now().fixed_offset();
    let exam_type = body
        .exam_type
        .as_deref()
        .map(parse_exam_type)
        .unwrap_or(ExamType::Official);

    let created = exam_packages::ActiveModel {
        id: Set(Uuid::new_v4()),
        category_id: Set(body.category_id),
        title: Set(body.title),
        exam_type: Set(exam_type.clone()),
        created_by_user_id: Set(Some(user_id)),
        description: Set(body.description),
        required_tier: Set(Some(body.required_tier.unwrap_or_else(|| "free".to_string()))),
        education_grade_id: Set(body.education_grade_id),
        is_active: Set(body.is_active.unwrap_or(true)),
        version_id: Set(body.version_id),
        created_at: Set(now),
        updated_at: Set(now),
        ..Default::default()
    }
    .insert(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    if exam_type == ExamType::Official {
        if let Some(grade_id) = body.education_grade_id {
            recalculate_exam_education_stats(state, body.category_id, grade_id).await;
        }
    }

    Ok(created.id)
}
