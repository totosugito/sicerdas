use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::book::services::list_book::list_book;
use crate::modules::book::types::BookListBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: Option<AuthSession>,
    Json(body): Json<BookListBody>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = auth.map(|a| a.user.id);
    let data = list_book(&state, body, user_id).await?;
    Ok(ApiResponse::ok(locale.t(LocaleKey::BookListSuccess), data))
}
