use crate::app::AppState;
use crate::error::AppError;
use crate::locales::RequestLocale;
use crate::modules::auth::services::{google_oauth, session::build_session_cookie};
use crate::modules::auth::types::{AuthUser, SocialSignInBody};
use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Extension, Json,
};
use axum_extra::extract::CookieJar;
use serde::Serialize;

#[derive(Serialize)]
struct SocialSignInResponse {
    token: String,
    user: AuthUser,
}

#[derive(Serialize)]
struct SocialRedirectResponse {
    url: String,
    redirect: bool,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(RequestLocale(lang)): Extension<RequestLocale>,
    headers: HeaderMap,
    jar: CookieJar,
    Json(body): Json<SocialSignInBody>,
) -> Result<impl IntoResponse, AppError> {
    if body.provider != "google" {
        return Err(AppError::BadRequest(format!(
            "Unsupported social provider: {}",
            body.provider
        )));
    }

    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string());
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    if let Some(id_token_payload) = body.id_token {
        let (session, user) = google_oauth::sign_in_with_google_id_token(
            &state,
            lang,
            &id_token_payload.token,
            ip_address,
            user_agent,
        )
        .await?;

        let cookie = build_session_cookie(&state.config, &session.token);
        let updated_jar = jar.add(cookie);

        return Ok((
            StatusCode::OK,
            updated_jar,
            Json(SocialSignInResponse {
                token: session.token,
                user,
            }),
        )
            .into_response());
    }

    let url = google_oauth::build_google_auth_url(&state, body.callback_url.as_deref()).await?;
    Ok((
        StatusCode::OK,
        Json(SocialRedirectResponse {
            url,
            redirect: true,
        }),
    )
        .into_response())
}
