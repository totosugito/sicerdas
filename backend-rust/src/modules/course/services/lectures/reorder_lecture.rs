use crate::app::AppState;
use crate::error::AppError;
use crate::modules::course::types::AdminReorderBody;
use sea_orm::{ConnectionTrait, DbBackend, Statement, TransactionTrait};
use uuid::Uuid;

pub async fn reorder_lectures(
    state: &AppState,
    _chapter_id: Uuid,
    input: AdminReorderBody,
) -> Result<(), AppError> {
    let txn = state.db.begin().await?;
    for item in input.items {
        txn.execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "UPDATE course_lectures SET position = $1::numeric, updated_at = NOW() WHERE id = $2",
            vec![item.position.into(), item.id.into()],
        ))
        .await?;
    }
    txn.commit().await?;
    Ok(())
}
