use crate::app::AppState;
use crate::error::AppError;
use crate::locales::RequestLocale;
use crate::modules::auth::services::{session::build_session_cookie, sign_up_email};
use crate::modules::auth::types::{AuthUser, SignUpEmailBody};
use axum::{
    extract::State,
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Extension, Json,
};
use axum_extra::extract::CookieJar;
use serde::Serialize;

#[derive(Serialize)]
struct SignUpResponse {
    token: String,
    user: AuthUser,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(RequestLocale(lang)): Extension<RequestLocale>,
    headers: HeaderMap,
    jar: CookieJar,
    Json(body): Json<SignUpEmailBody>,
) -> Result<impl IntoResponse, AppError> {
    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string());
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let (session, user) = sign_up_email::execute(
        &state,
        lang,
        &body.email,
        &body.password,
        body.name.as_deref(),
        ip_address,
        user_agent,
    )
    .await?;

    let cookie = build_session_cookie(&state.config, &session.token);
    let updated_jar = jar.add(cookie);

    Ok((
        StatusCode::OK,
        updated_jar,
        Json(SignUpResponse {
            token: session.token,
            user,
        }),
    ))
}
