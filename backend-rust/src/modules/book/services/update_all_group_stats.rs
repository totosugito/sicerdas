use crate::app::AppState;
use crate::db::entities::app_version::ContentStatus;
use crate::db::entities::{book_group_stats, books};
use crate::error::AppError;
use crate::modules::book::types::GroupStatsItem;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, DbBackend, EntityTrait, FromQueryResult, PaginatorTrait,
    QueryFilter, Set, Statement,
};

#[derive(Debug, FromQueryResult)]
struct GroupIdRow {
    id: i32,
}

pub async fn update_all_group_stats(state: &AppState) -> Result<Vec<GroupStatsItem>, AppError> {
    let groups = GroupIdRow::find_by_statement(Statement::from_string(
        DbBackend::Postgres,
        r#"
        SELECT bg.id
        FROM book_group bg
        INNER JOIN books b ON bg.id = b.book_group_id
        WHERE b.status = 'published'::status
        GROUP BY bg.id
        ORDER BY bg.id ASC
        "#,
    ))
    .all(&state.db)
    .await?;

    let mut results = Vec::with_capacity(groups.len());
    let now = Utc::now();

    for g in groups {
        let book_total = books::Entity::find()
            .filter(books::Column::BookGroupId.eq(g.id))
            .filter(books::Column::Status.eq(ContentStatus::Published))
            .count(&state.db)
            .await? as i32;

        let existing_stats = book_group_stats::Entity::find()
            .filter(book_group_stats::Column::BookGroupId.eq(g.id))
            .one(&state.db)
            .await?;

        let saved = if let Some(stats) = existing_stats {
            let mut active: book_group_stats::ActiveModel = stats.into();
            active.book_total = Set(Some(book_total));
            active.updated_at = Set(Some(now.into()));
            active.update(&state.db).await?
        } else {
            let active = book_group_stats::ActiveModel {
                book_group_id: Set(g.id),
                book_total: Set(Some(book_total)),
                created_at: Set(Some(now.into())),
                updated_at: Set(Some(now.into())),
                ..Default::default()
            };
            active.insert(&state.db).await?
        };

        results.push(GroupStatsItem {
            group_id: saved.book_group_id,
            book_total: saved.book_total.unwrap_or(0),
            updated_at: saved
                .updated_at
                .map(|d| d.to_rfc3339())
                .unwrap_or_else(|| now.to_rfc3339()),
        });
    }

    Ok(results)
}
