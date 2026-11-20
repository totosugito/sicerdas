use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::users::services::revoke_session::revoke_session;
use crate::modules::users::types::RevokeSessionBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<RevokeSessionBody>,
) -> Result<impl IntoResponse, AppError> {
    revoke_session(&state, auth.user.id, &body.session_token, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::UserSessionsSessionRevoked),
    ))
}
