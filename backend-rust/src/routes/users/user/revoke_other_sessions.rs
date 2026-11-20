use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::users::services::revoke_other_sessions::revoke_other_sessions;
use crate::modules::users::types::RevokeOtherSessionsBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<RevokeOtherSessionsBody>,
) -> Result<impl IntoResponse, AppError> {
    let deleted = revoke_other_sessions(&state, auth.user.id, &body.token, locale).await?;
    let msg = locale
        .t(LocaleKey::AuthSessionsRevoked)
        .replace("{{count}}", &deleted.to_string());
    Ok(ApiResponse::msg(msg))
}
