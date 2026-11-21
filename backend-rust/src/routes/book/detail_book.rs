use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::book::services::detail_book::detail_book;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    http::{header, HeaderMap},
    response::IntoResponse,
};
use axum_extra::extract::CookieJar;
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: Option<AuthSession>,
    jar: CookieJar,
    headers: HeaderMap,
    Path(book_id): Path<i32>,
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

    let data = detail_book(
        &state,
        locale.0,
        book_id,
        user_id,
        ip.as_deref(),
        user_agent,
        session_id,
    )
    .await?;

    Ok(ApiResponse::ok(locale.t(LocaleKey::BookDetailSuccess), data))
}
