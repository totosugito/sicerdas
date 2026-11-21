use crate::app::AppState;
use crate::error::AppError;
use crate::modules::course::types::CategoryStatItem;
use sea_orm::{DbBackend, FromQueryResult, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct CategoryStatRow {
    category_id: Uuid,
    category_name: Option<String>,
    courses_enrolled: i32,
    courses_completed: i32,
}

pub async fn get_category_stats(
    state: &AppState,
    user_id: Uuid,
) -> Result<Vec<CategoryStatItem>, AppError> {
    let rows = CategoryStatRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            s.category_id,
            ec.name AS category_name,
            s.courses_enrolled,
            s.courses_completed
        FROM course_user_stats_category s
        LEFT JOIN education_categories ec ON s.category_id = ec.id
        WHERE s.user_id = $1
        ORDER BY s.courses_enrolled DESC, s.updated_at DESC
        LIMIT 10
        "#,
        vec![user_id.into()],
    ))
    .all(&state.db)
    .await?;

    Ok(rows
        .into_iter()
        .map(|r| CategoryStatItem {
            category_id: r.category_id,
            category_name: r.category_name.unwrap_or_default(),
            courses_enrolled: r.courses_enrolled,
            courses_completed: r.courses_completed,
        })
        .collect())
}
