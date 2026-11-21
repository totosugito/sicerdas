use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::book::services::user_stats::user_stats;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
) -> Result<impl IntoResponse, AppError> {
    let data = user_stats(&state, auth.user.id).await?;
    Ok(ApiResponse::ok(locale.t(LocaleKey::BookListSuccess), data))
}
