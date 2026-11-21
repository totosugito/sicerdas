use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{
    AdminPackageItem, PackageCategoryRef, PackageGradeRef, PackageStatsInfo,
};
use crate::modules::exam::utils::get_package_thumbnail_url;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct AdminPackageDetailRow {
    id: Uuid,
    category_id: Uuid,
    title: String,
    exam_type: String,
    duration_minutes: i32,
    description: Option<String>,
    required_tier: String,
    education_grade_id: Option<i32>,
    is_active: bool,
    version_id: Option<i32>,
    thumbnail: Option<String>,
    parent_package_id: Option<Uuid>,
    total_sections: i32,
    active_sections: i32,
    total_questions: i32,
    active_questions: i32,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    cat_id: Option<Uuid>,
    cat_name: Option<String>,
    cat_key: Option<String>,
    grade_id: Option<i32>,
    grade_name: Option<String>,
    view_count: Option<i32>,
    like_count: Option<i32>,
    bookmark_count: Option<i32>,
    rating_count: Option<i32>,
    rating: Option<f64>,
    is_new: bool,
}

pub async fn admin_detail_package(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    latest_version_id: Option<i32>,
) -> Result<AdminPackageItem, AppError> {
    let is_new_sql = match latest_version_id {
        Some(vid) => format!("COALESCE(ep.version_id = {vid}, false)"),
        None => "false".to_string(),
    };

    let sql = format!(
        r#"
        SELECT
            ep.id,
            ep.category_id,
            ep.title,
            ep.exam_type::text AS exam_type,
            ep.duration_minutes,
            ep.description,
            ep.required_tier::text AS required_tier,
            ep.education_grade_id,
            ep.is_active,
            ep.version_id,
            ep.thumbnail,
            ep.parent_package_id,
            ep.total_sections,
            ep.active_sections,
            ep.total_questions,
            ep.active_questions,
            ep.created_at,
            ep.updated_at,
            ec.id AS cat_id,
            ec.name AS cat_name,
            ec.key AS cat_key,
            eg.id AS grade_id,
            eg.name AS grade_name,
            epes.view_count,
            epes.like_count,
            epes.bookmark_count,
            epes.rating_count,
            epes.rating::float8 AS rating,
            {is_new_sql} AS is_new
        FROM exam_packages ep
        LEFT JOIN education_categories ec ON ec.id = ep.category_id
        LEFT JOIN education_grades eg ON eg.id = ep.education_grade_id
        LEFT JOIN exam_package_event_stats epes ON epes.package_id = ep.id
        WHERE ep.id = $1
        LIMIT 1
        "#
    );

    let row = AdminPackageDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        vec![Value::Uuid(Some(Box::new(id)))],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDetailNotFound)))?;

    Ok(AdminPackageItem {
        id: row.id,
        category_id: row.category_id,
        title: row.title,
        exam_type: row.exam_type,
        duration_minutes: row.duration_minutes,
        description: row.description,
        required_tier: row.required_tier,
        education_grade_id: row.education_grade_id,
        is_active: row.is_active,
        version_id: row.version_id,
        thumbnail: get_package_thumbnail_url(state, row.thumbnail.as_deref()),
        parent_package_id: row.parent_package_id,
        total_sections: row.total_sections,
        active_sections: row.active_sections,
        total_questions: row.total_questions,
        active_questions: row.active_questions,
        is_new: row.is_new,
        created_at: row.created_at.to_rfc3339(),
        updated_at: row.updated_at.to_rfc3339(),
        category: match (row.cat_id, row.cat_name, row.cat_key) {
            (Some(id), Some(name), Some(key)) => Some(PackageCategoryRef { id, name, key }),
            _ => None,
        },
        grade: match (row.grade_id, row.grade_name) {
            (Some(id), Some(name)) => Some(PackageGradeRef { id, name }),
            _ => None,
        },
        stats: PackageStatsInfo {
            view_count: row.view_count.unwrap_or(0),
            like_count: row.like_count.unwrap_or(0),
            bookmark_count: row.bookmark_count.unwrap_or(0),
            rating_count: row.rating_count.unwrap_or(0),
            rating: row.rating.unwrap_or(0.0),
            active_sections: row.active_sections,
            active_questions: row.active_questions,
        },
    })
}
