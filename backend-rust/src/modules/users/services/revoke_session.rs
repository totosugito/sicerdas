use crate::app::AppState;
use crate::db::entities::users_sessions;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use sea_orm::{ColumnTrait, EntityTrait, ModelTrait, QueryFilter};
use uuid::Uuid;

pub async fn revoke_session(
    state: &AppState,
    user_id: Uuid,
    session_token: &str,
    locale: RequestLocale,
) -> Result<(), AppError> {
    let session = users_sessions::Entity::find()
        .filter(users_sessions::Column::Token.eq(session_token))
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::UserSessionsSessionNotFound)))?;

    if session.user_id != user_id {
        return Err(AppError::Forbidden(
            locale.t(LocaleKey::UserSessionsAccessDenied),
        ));
    }

    session.delete(&state.db).await?;
    state.session_cache.invalidate(session_token).await;
    Ok(())
}
