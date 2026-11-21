use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::book::services::rating::rate_book;
use crate::modules::book::types::RatingBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<RatingBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = rate_book(&state, locale.0, auth.user.id, body.book_id, body.rating).await?;
    Ok(ApiResponse::ok(locale.t(LocaleKey::BookDetailSuccess), data))
}
