use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::users::services::sessions_list::list_sessions;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
) -> Result<impl IntoResponse, AppError> {
    let data = list_sessions(&state, auth.user.id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::UserSessionsListSuccess),
        data,
    ))
}
