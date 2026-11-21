use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::book::services::bookmark::bookmark_book;
use crate::modules::book::types::BookmarkBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<BookmarkBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = bookmark_book(&state, locale.0, auth.user.id, body.book_id, body.bookmarked).await?;
    let msg_key = if body.bookmarked {
        LocaleKey::BookBookmarkUpdated
    } else {
        LocaleKey::BookBookmarkNoChange
    };
    Ok(ApiResponse::ok(locale.t(msg_key), data))
}
