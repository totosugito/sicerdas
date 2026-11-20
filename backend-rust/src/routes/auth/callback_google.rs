use crate::app::AppState;
use crate::error::AppError;
use crate::locales::RequestLocale;
use crate::modules::auth::services::{google_oauth, session::build_session_cookie};
use axum::{
    extract::{Query, State},
    http::{header, HeaderMap},
    response::{IntoResponse, Redirect},
    Extension,
};
use axum_extra::extract::CookieJar;
use serde::Deserialize;

#[derive(Deserialize)]
pub struct GoogleCallbackQuery {
    pub code: Option<String>,
    pub state: Option<String>,
    pub error: Option<String>,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(RequestLocale(lang)): Extension<RequestLocale>,
    headers: HeaderMap,
    jar: CookieJar,
    Query(query): Query<GoogleCallbackQuery>,
) -> Result<impl IntoResponse, AppError> {
    if let Some(err) = query.error {
        return Err(AppError::BadRequest(format!("Google OAuth error: {err}")));
    }

    let code = query
        .code
        .as_deref()
        .ok_or_else(|| AppError::BadRequest("Missing OAuth code".to_string()))?;
    let oauth_state = query
        .state
        .as_deref()
        .ok_or_else(|| AppError::BadRequest("Missing OAuth state".to_string()))?;

    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string());
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let (session, redirect_after) = google_oauth::handle_google_callback(
        &state,
        lang,
        code,
        oauth_state,
        ip_address,
        user_agent,
    )
    .await?;

    let cookie = build_session_cookie(&state.config, &session.token);
    let updated_jar = jar.add(cookie);

    Ok((updated_jar, Redirect::temporary(&redirect_after)))
}
