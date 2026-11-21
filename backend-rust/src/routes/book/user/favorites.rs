use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::book::services::favorites::list_favorites;
use crate::modules::book::types::{BookPaginationQuery, PaginatedListResponse};
use axum::{
    extract::{Query, State},
    http::StatusCode,
    response::IntoResponse,
    Json,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Query(query): Query<BookPaginationQuery>,
) -> Result<impl IntoResponse, AppError> {
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(10);
    let (data, pagination) = list_favorites(&state, auth.user.id, page, limit).await?;
    Ok((
        StatusCode::OK,
        Json(PaginatedListResponse {
            success: true,
            message: locale.t(LocaleKey::BookListSuccess),
            data,
            pagination,
        }),
    ))
}
