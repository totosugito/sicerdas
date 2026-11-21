use crate::app::AppState;
use crate::error::AppError;
use crate::modules::book::types::{
    BookGradeRef, BookSimpleCategoryRef, HistoryBookItem, HistoryBookStats,
};
use crate::modules::book::utils::get_book_cover_url;
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct HistoryRow {
    id: Uuid,
    book_id: i32,
    title: String,
    author: String,
    category_name: String,
    grade_id: i32,
    grade_name: String,
    grade_val: String,
    rating: Option<f64>,
    bookmark_count: Option<i32>,
    view_count: Option<i32>,
    download_count: Option<i32>,
    is_downloaded: bool,
    viewed_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_history(
    state: &AppState,
    user_id: Uuid,
    page: u64,
    limit: u64,
) -> Result<(Vec<HistoryBookItem>, PaginationMeta), AppError> {
    let page = page.max(1);
    let limit = limit.clamp(1, 20);
    let offset = (page - 1) * limit;

    let count_row = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT COUNT(*)::bigint AS total
        FROM book_interactions bi
        INNER JOIN books b ON bi.book_id = b.id
        WHERE bi.user_id = $1 AND bi.view_count > 0
        "#,
        vec![user_id.into()],
    ))
    .one(&state.db)
    .await?
    .unwrap_or(CountRow { total: 0 });

    let total = count_row.total.max(0) as u64;
    let total_pages = if total == 0 { 0 } else { total.div_ceil(limit) };

    let rows = HistoryRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            b.id,
            b.book_id,
            b.title,
            b.author,
            bc.name AS category_name,
            eg.id AS grade_id,
            eg.name AS grade_name,
            eg.grade AS grade_val,
            bes.rating::float8 AS rating,
            bes.bookmark_count,
            bes.view_count,
            bes.download_count,
            (COALESCE(bi.download_count, 0) > 0) AS is_downloaded,
            bi.updated_at AS viewed_at
        FROM book_interactions bi
        INNER JOIN books b ON bi.book_id = b.id
        INNER JOIN book_group bg ON b.book_group_id = bg.id
        INNER JOIN book_category bc ON bg.category_id = bc.id
        INNER JOIN education_grades eg ON b.education_grade_id = eg.id
        LEFT JOIN book_event_stats bes ON b.id = bes.book_id
        WHERE bi.user_id = $1 AND bi.view_count > 0
        ORDER BY bi.updated_at DESC
        LIMIT $2 OFFSET $3
        "#,
        vec![user_id.into(), (limit as i64).into(), (offset as i64).into()],
    ))
    .all(&state.db)
    .await?;

    let s3_public = state.config.s3_public_url.as_deref();
    let items = rows
        .into_iter()
        .map(|row| HistoryBookItem {
            id: row.id,
            book_id: row.book_id,
            title: row.title,
            author: Some(row.author),
            cover: get_book_cover_url(s3_public, row.book_id),
            category: BookSimpleCategoryRef {
                name: row.category_name,
            },
            grade: BookGradeRef {
                id: row.grade_id,
                name: row.grade_name,
                grade: row.grade_val,
            },
            stats: HistoryBookStats {
                rating: row.rating.unwrap_or(0.0),
                bookmark_count: row.bookmark_count.unwrap_or(0),
                view_count: row.view_count.unwrap_or(0),
                download_count: row.download_count.unwrap_or(0),
                is_downloaded: row.is_downloaded,
            },
            viewed_at: row.viewed_at.to_rfc3339(),
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
