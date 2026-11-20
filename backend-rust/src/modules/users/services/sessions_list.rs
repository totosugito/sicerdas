use crate::app::AppState;
use crate::db::entities::users_sessions;
use crate::error::AppError;
use crate::modules::users::types::SessionItem;
use chrono::Utc;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use uuid::Uuid;

pub async fn list_sessions(state: &AppState, user_id: Uuid) -> Result<Vec<SessionItem>, AppError> {
    let now = Utc::now().fixed_offset();
    let rows = users_sessions::Entity::find()
        .filter(users_sessions::Column::UserId.eq(user_id))
        .filter(users_sessions::Column::ExpiresAt.gt(now))
        .order_by_desc(users_sessions::Column::UpdatedAt)
        .all(&state.db)
        .await?;

    Ok(rows
        .into_iter()
        .map(|s| SessionItem {
            id: s.id,
            expires_at: s.expires_at.to_rfc3339(),
            created_at: s.created_at.to_rfc3339(),
            updated_at: s.updated_at.to_rfc3339(),
            ip_address: s.ip_address,
            user_agent: s.user_agent,
            token: s.token,
        })
        .collect())
}
