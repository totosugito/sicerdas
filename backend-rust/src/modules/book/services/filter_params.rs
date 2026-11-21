use crate::app::AppState;
use crate::error::AppError;
use crate::modules::book::types::{
    FilterParamsGroupItem, FilterParamsGroupStats, FilterParamsItem,
};
use indexmap::IndexMap;
use sea_orm::{DbBackend, FromQueryResult, Statement};

#[derive(Debug, FromQueryResult)]
struct FilterRow {
    category_id: i32,
    category_code: String,
    category_name: String,
    category_desc: Option<String>,
    category_status: String,
    group_id: Option<i32>,
    group_name: Option<String>,
    group_short_name: Option<String>,
    group_desc: Option<String>,
    group_status: Option<String>,
    book_total: Option<i32>,
}

pub async fn filter_params(state: &AppState) -> Result<Vec<FilterParamsItem>, AppError> {
    let rows = FilterRow::find_by_statement(Statement::from_string(
        DbBackend::Postgres,
        r#"
        SELECT
            bc.id AS category_id,
            bc.code AS category_code,
            bc.name AS category_name,
            bc."desc" AS category_desc,
            bc.status::text AS category_status,
            bg.id AS group_id,
            bg.name AS group_name,
            bg.short_name AS group_short_name,
            bg."desc" AS group_desc,
            bg.status::text AS group_status,
            bgs.book_total
        FROM book_category bc
        LEFT JOIN book_group bg ON bg.category_id = bc.id
        LEFT JOIN book_group_stats bgs ON bgs.book_group_id = bg.id
        WHERE (bgs.book_total IS NOT NULL AND bgs.book_total > 0) OR bg.id IS NULL
        ORDER BY bc.id ASC, bg.id ASC
        "#,
    ))
    .all(&state.db)
    .await?;

    let mut categories: IndexMap<i32, FilterParamsItem> = IndexMap::new();

    for row in rows {
        let entry = categories.entry(row.category_id).or_insert_with(|| FilterParamsItem {
            id: row.category_id,
            code: row.category_code,
            name: row.category_name,
            desc: row.category_desc.filter(|s| !s.is_empty()),
            status: row.category_status,
            groups: Vec::new(),
        });

        if let Some(gid) = row.group_id {
            entry.groups.push(FilterParamsGroupItem {
                id: gid,
                name: row.group_name.unwrap_or_default(),
                short_name: row.group_short_name.unwrap_or_default(),
                desc: row.group_desc.filter(|s| !s.is_empty()),
                status: row.group_status.unwrap_or_default(),
                stats: FilterParamsGroupStats {
                    book_total: row.book_total.unwrap_or(0),
                },
            });
        }
    }

    Ok(categories
        .into_values()
        .filter(|c| !c.groups.is_empty())
        .collect())
}
