use crate::app::AppState;
use crate::error::AppError;
use crate::middleware::auth::AuthSession;
use crate::modules::auth::services::session::revoke_other_sessions;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;

#[derive(Serialize)]
struct RevokeResponse {
    status: bool,
}

pub async fn handler(
    State(state): State<AppState>,
    auth: AuthSession,
) -> Result<impl IntoResponse, AppError> {
    revoke_other_sessions(&state, auth.user.id, &auth.session.token).await?;
    Ok((StatusCode::OK, Json(RevokeResponse { status: true })))
}
