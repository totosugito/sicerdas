use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::book::services::update_download::update_download;
use crate::modules::book::types::DownloadBody;
use crate::types::response::ApiResponse;
use axum::{
    extract::State,
    http::{header, HeaderMap},
    response::IntoResponse,
    Json,
};
use axum_extra::extract::CookieJar;
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: Option<AuthSession>,
    jar: CookieJar,
    headers: HeaderMap,
    Json(body): Json<DownloadBody>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = auth.map(|a| a.user.id);
    let session_id = jar
        .get("sessionId")
        .and_then(|c| Uuid::parse_str(c.value()).ok());
    let ip = headers
        .get("x-forwarded-for")
        .or_else(|| headers.get("x-real-ip"))
        .and_then(|v| v.to_str().ok())
        .and_then(|s| s.split(',').next())
        .map(|s| s.trim().to_string());
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok());

    let data = update_download(
        &state,
        locale.0,
        body,
        user_id,
        session_id,
        ip.as_deref(),
        user_agent,
    )
    .await?;

    Ok(ApiResponse::ok(
        locale.t(LocaleKey::BookDownloadUpdated),
        data,
    ))
}
