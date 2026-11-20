use crate::app::AppState;
use crate::error::AppError;
use crate::modules::auth::crypto::verify_signed_cookie_value;
use crate::modules::auth::services::session::{clear_session_cookie, revoke_session_by_token};
use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use axum_extra::extract::CookieJar;
use serde::Serialize;

#[derive(Serialize)]
struct SignOutResponse {
    success: bool,
}

pub async fn handler(
    State(state): State<AppState>,
    headers: HeaderMap,
    jar: CookieJar,
) -> Result<impl IntoResponse, AppError> {
    let mut token = headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.strip_prefix("Bearer "))
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty());

    if token.is_none() {
        let cookie_name = format!("{}.session_token", state.config.cookie_prefix);
        if let Some(cookie) = jar.get(&cookie_name) {
            token = verify_signed_cookie_value(cookie.value(), &state.config.better_auth_secret);
        }
    }

    if let Some(token) = token {
        revoke_session_by_token(&state, &token).await?;
    }

    let cleared = clear_session_cookie(&state.config);
    let updated_jar = jar.remove(cleared);

    Ok((
        StatusCode::OK,
        updated_jar,
        Json(SignOutResponse { success: true }),
    ))
}
