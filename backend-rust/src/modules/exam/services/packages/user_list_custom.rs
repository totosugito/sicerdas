use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    CustomPackageItem, CustomPackageStats, FavoritePackageCategory, FavoritePackageInteraction,
    ListCustomBody,
};
use crate::modules::exam::utils::get_package_thumbnail_url;
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct CustomRow {
    id: Uuid,
    title: String,
    thumbnail: Option<String>,
    duration_minutes: i32,
    active_questions: i32,
    active_sections: i32,
    category_name: Option<String>,
    grade_name: Option<String>,
    status: Option<String>,
    completed_sections_count: Option<i32>,
    created_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn user_list_custom(
    state: &AppState,
    user_id: Uuid,
    body: ListCustomBody,
) -> Result<(Vec<CustomPackageItem>, PaginationMeta), AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let page_size = body.page_size.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * page_size;

    let count_row = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT COUNT(*) AS total
        FROM exam_packages
        WHERE created_by_user_id = $1
          AND exam_type = 'custom_practice'
          AND is_active = true
        "#,
        vec![Value::Uuid(Some(Box::new(user_id)))],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let total = count_row.map(|r| r.total as u64).unwrap_or(0);

    let rows = CustomRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            ep.id,
            ep.title,
            ep.thumbnail,
            ep.duration_minutes,
            ep.active_questions,
            ep.active_sections,
            ec.name AS category_name,
            eg.name AS grade_name,
            epi.status::text AS status,
            epi.completed_sections_count,
            ep.created_at
        FROM exam_packages ep
        LEFT JOIN education_categories ec ON ec.id = ep.category_id
        LEFT JOIN education_grades eg ON eg.id = ep.education_grade_id
        LEFT JOIN exam_package_interactions epi
          ON epi.package_id = ep.id AND epi.user_id = $1
        WHERE ep.created_by_user_id = $1
          AND ep.exam_type = 'custom_practice'
          AND ep.is_active = true
        ORDER BY ep.created_at DESC
        LIMIT $2 OFFSET $3
        "#,
        vec![
            Value::Uuid(Some(Box::new(user_id))),
            Value::BigInt(Some(page_size as i64)),
            Value::BigInt(Some(offset as i64)),
        ],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|row| CustomPackageItem {
            id: row.id,
            title: row.title,
            thumbnail: get_package_thumbnail_url(state, row.thumbnail.as_deref()),
            duration_minutes: row.duration_minutes,
            stats: CustomPackageStats {
                active_questions: row.active_questions,
                active_sections: row.active_sections,
            },
            category: FavoritePackageCategory {
                name: row.category_name.unwrap_or_default(),
            },
            grade: FavoritePackageCategory {
                name: row.grade_name.unwrap_or_default(),
            },
            user_interaction: FavoritePackageInteraction {
                status: row.status.unwrap_or_else(|| "not_started".to_string()),
                completed_sections_count: row.completed_sections_count.unwrap_or(0),
            },
            created_at: row.created_at.to_rfc3339(),
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + page_size - 1) / page_size
    };

    Ok((
        items,
        PaginationMeta {
            total,
            page,
            limit: page_size,
            total_pages,
        },
    ))
}
