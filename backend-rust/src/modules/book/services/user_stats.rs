use crate::app::AppState;
use crate::error::AppError;
use crate::modules::book::types::UserBookStatsData;
use sea_orm::{DbBackend, FromQueryResult, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct StatsRow {
    total_favorites: i64,
    total_materials_read: i64,
    total_downloads: i64,
}

pub async fn user_stats(state: &AppState, user_id: Uuid) -> Result<UserBookStatsData, AppError> {
    let row = StatsRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            COUNT(*) FILTER (WHERE bookmarked = true)::bigint AS total_favorites,
            COUNT(*) FILTER (WHERE view_count > 0)::bigint AS total_materials_read,
            COALESCE(SUM(download_count), 0)::bigint AS total_downloads
        FROM book_interactions
        WHERE user_id = $1
        "#,
        vec![user_id.into()],
    ))
    .one(&state.db)
    .await?
    .unwrap_or(StatsRow {
        total_favorites: 0,
        total_materials_read: 0,
        total_downloads: 0,
    });

    Ok(UserBookStatsData {
        total_favorites: row.total_favorites,
        total_materials_read: row.total_materials_read,
        total_downloads: row.total_downloads,
    })
}
