use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::app::services::book_info::get_book_info;
use crate::modules::app::types::BookInfoQuery;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Query, State},
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Query(query): Query<BookInfoQuery>,
) -> Result<impl IntoResponse, AppError> {
    let data = get_book_info(&state, query.book_id, query.page, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::BookDetailSuccess),
        data,
    ))
}
