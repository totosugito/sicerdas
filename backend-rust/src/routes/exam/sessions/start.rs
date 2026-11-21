use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::sessions::start_session::start_session;
use crate::modules::exam::types::StartSessionBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<StartSessionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = start_session(&state, locale.0, auth.user.id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSessionsStartSuccess),
        data,
    ))
}
