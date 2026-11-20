use crate::app::AppState;
use crate::error::AppError;
use crate::modules::auth::crypto::verify_signed_cookie_value;
use crate::modules::auth::services::session::get_session_by_token;
use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Json,
};
use axum_extra::extract::CookieJar;

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

    let Some(token) = token else {
        return Ok((StatusCode::OK, Json(serde_json::Value::Null)));
    };

    match get_session_by_token(&state, &token).await? {
        Some(data) => Ok((StatusCode::OK, Json(serde_json::to_value(data).unwrap()))),
        None => Ok((StatusCode::OK, Json(serde_json::Value::Null))),
    }
}
