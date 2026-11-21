use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::sessions::all_sessions::all_sessions;
use crate::modules::exam::types::AllSessionsBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<AllSessionsBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = all_sessions(&state, auth.user.id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSessionsHistorySuccess),
        data,
    ))
}
