use crate::app::AppState;
use crate::db::entities::users_sessions;
use crate::error::AppError;
use crate::locales::RequestLocale;
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter};
use uuid::Uuid;

pub async fn revoke_other_sessions(
    state: &AppState,
    user_id: Uuid,
    keep_token: &str,
    _locale: RequestLocale,
) -> Result<u64, AppError> {
    let other_sessions = users_sessions::Entity::find()
        .filter(users_sessions::Column::UserId.eq(user_id))
        .filter(users_sessions::Column::Token.ne(keep_token))
        .all(&state.db)
        .await?;

    if other_sessions.is_empty() {
        return Ok(0);
    }

    let tokens: Vec<String> = other_sessions.iter().map(|s| s.token.clone()).collect();
    let res = users_sessions::Entity::delete_many()
        .filter(users_sessions::Column::UserId.eq(user_id))
        .filter(users_sessions::Column::Token.ne(keep_token))
        .exec(&state.db)
        .await?;

    for tok in tokens {
        state.session_cache.invalidate(&tok).await;
    }

    Ok(res.rows_affected)
}
