use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{
    PackageCategoryRef, PackageGradeRef, PackageStatsInfo, PackageUserInteraction,
    PublicPackageItem,
};
use crate::modules::exam::utils::get_package_thumbnail_url;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct PublicDetailRow {
    id: Uuid,
    title: String,
    description: Option<String>,
    exam_type: String,
    duration_minutes: i32,
    thumbnail: Option<String>,
    required_tier: String,
    is_active: bool,
    parent_package_id: Option<Uuid>,
    active_sections: i32,
    active_questions: i32,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
    cat_id: Uuid,
    cat_name: String,
    cat_key: String,
    grade_id: Option<i32>,
    grade_name: Option<String>,
    rating: Option<f64>,
    rating_count: Option<i32>,
    view_count: Option<i32>,
    like_count: Option<i32>,
    bookmark_count: Option<i32>,
    is_new: bool,
    liked: Option<bool>,
    disliked: Option<bool>,
    user_rating: Option<f64>,
    bookmarked: Option<bool>,
    interaction_status: Option<String>,
    completed_sections_count: Option<i32>,
    user_view_count: Option<i32>,
}

pub async fn detail_package(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    user_id: Option<Uuid>,
    latest_version_id: Option<i32>,
) -> Result<PublicPackageItem, AppError> {
    let is_new_sql = match latest_version_id {
        Some(vid) => format!("COALESCE(ep.version_id = {vid}, false)"),
        None => "false".to_string(),
    };

    let mut params: Vec<Value> = vec![Value::Uuid(Some(Box::new(id)))];
    let (interaction_join, access_clause) = if let Some(uid) = user_id {
        params.push(Value::Uuid(Some(Box::new(uid))));
        let uidx = params.len();
        (
            format!(
                "LEFT JOIN exam_package_interactions epi ON epi.package_id = ep.id AND epi.user_id = ${uidx}"
            ),
            format!("(ep.exam_type = 'official' OR ep.created_by_user_id = ${uidx})"),
        )
    } else {
        (
            "LEFT JOIN exam_package_interactions epi ON FALSE".to_string(),
            "ep.exam_type = 'official'".to_string(),
        )
    };

    let sql = format!(
        r#"
        SELECT
            ep.id,
            ep.title,
            ep.description,
            ep.exam_type::text AS exam_type,
            ep.duration_minutes,
            ep.thumbnail,
            ep.required_tier::text AS required_tier,
            ep.is_active,
            ep.parent_package_id,
            ep.active_sections,
            ep.active_questions,
            ep.created_at,
            ep.updated_at,
            ec.id AS cat_id,
            ec.name AS cat_name,
            ec.key AS cat_key,
            eg.id AS grade_id,
            eg.name AS grade_name,
            epes.rating::float8 AS rating,
            epes.rating_count,
            epes.view_count,
            epes.like_count,
            epes.bookmark_count,
            {is_new_sql} AS is_new,
            epi.liked,
            epi.disliked,
            epi.rating::float8 AS user_rating,
            epi.bookmarked,
            epi.status::text AS interaction_status,
            epi.completed_sections_count,
            epi.view_count AS user_view_count
        FROM exam_packages ep
        INNER JOIN education_categories ec ON ec.id = ep.category_id
        LEFT JOIN education_grades eg ON eg.id = ep.education_grade_id
        LEFT JOIN exam_package_event_stats epes ON epes.package_id = ep.id
        {interaction_join}
        WHERE ep.id = $1 AND ep.is_active = true AND {access_clause}
        LIMIT 1
        "#
    );

    let row = PublicDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        params,
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDetailNotFound)))?;

    Ok(PublicPackageItem {
        id: row.id,
        title: row.title,
        description: row.description,
        exam_type: row.exam_type,
        duration_minutes: row.duration_minutes,
        thumbnail: get_package_thumbnail_url(state, row.thumbnail.as_deref()),
        required_tier: row.required_tier,
        is_active: row.is_active,
        parent_package_id: row.parent_package_id,
        is_new: row.is_new,
        created_at: row.created_at.to_rfc3339(),
        updated_at: row.updated_at.to_rfc3339(),
        category: PackageCategoryRef {
            id: row.cat_id,
            name: row.cat_name,
            key: row.cat_key,
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
        user_interaction: if user_id.is_some() {
            Some(PackageUserInteraction {
                liked: row.liked.unwrap_or(false),
                disliked: row.disliked.unwrap_or(false),
                rating: row.user_rating.unwrap_or(0.0),
                bookmarked: row.bookmarked.unwrap_or(false),
                status: row
                    .interaction_status
                    .unwrap_or_else(|| "not_started".to_string()),
                completed_sections_count: row.completed_sections_count.unwrap_or(0),
                view_count: row.user_view_count.unwrap_or(0),
            })
        } else {
            None
        },
    })
}
