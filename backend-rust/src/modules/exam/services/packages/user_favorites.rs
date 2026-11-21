use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{
    FavoritePackageCategory, FavoritePackageInteraction, FavoritePackageItem,
    FavoritePackageStats, FavoritesBody,
};
use crate::modules::exam::utils::get_package_thumbnail_url;
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{ConnectionTrait, DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct FavoriteRow {
    id: Uuid,
    title: String,
    thumbnail: Option<String>,
    active_questions: i32,
    active_sections: i32,
    category_name: String,
    rating: Option<f64>,
    status: String,
    completed_sections_count: i32,
    bookmarked_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn user_favorites(
    state: &AppState,
    user_id: Uuid,
    body: FavoritesBody,
) -> Result<(Vec<FavoritePackageItem>, PaginationMeta), AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let page_size = body.page_size.unwrap_or(5).clamp(1, 100);
    let offset = (page - 1) * page_size;

    let count_row = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT COUNT(*) AS total
        FROM exam_package_interactions epi
        INNER JOIN exam_packages ep ON ep.id = epi.package_id
        WHERE epi.user_id = $1 AND epi.bookmarked = true AND ep.is_active = true
        "#,
        vec![Value::Uuid(Some(Box::new(user_id)))],
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let total = count_row.map(|r| r.total as u64).unwrap_or(0);

    let rows = FavoriteRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            ep.id,
            ep.title,
            ep.thumbnail,
            ep.active_questions,
            ep.active_sections,
            ec.name AS category_name,
            COALESCE(epes.rating::float8, 0.0) AS rating,
            epi.status::text AS status,
            epi.completed_sections_count,
            epi.updated_at AS bookmarked_at
        FROM exam_package_interactions epi
        INNER JOIN exam_packages ep ON ep.id = epi.package_id
        INNER JOIN education_categories ec ON ec.id = ep.category_id
        LEFT JOIN exam_package_event_stats epes ON epes.package_id = ep.id
        WHERE epi.user_id = $1 AND epi.bookmarked = true AND ep.is_active = true
        ORDER BY epi.updated_at DESC
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
        .map(|row| FavoritePackageItem {
            id: row.id,
            title: row.title,
            category: FavoritePackageCategory {
                name: row.category_name,
            },
            thumbnail: get_package_thumbnail_url(state, row.thumbnail.as_deref()),
            stats: FavoritePackageStats {
                rating: row.rating.unwrap_or(0.0),
                active_questions: row.active_questions,
                active_sections: row.active_sections,
            },
            user_interaction: FavoritePackageInteraction {
                status: row.status,
                completed_sections_count: row.completed_sections_count,
            },
            bookmarked_at: row.bookmarked_at.to_rfc3339(),
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
