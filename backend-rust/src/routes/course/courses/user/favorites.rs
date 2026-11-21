use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::course::services::courses::interactions::list_favorites;
use crate::modules::course::types::FavoritesQuery;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Query(query): Query<FavoritesQuery>,
) -> Result<impl IntoResponse, AppError> {
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(10);
    let data = list_favorites(&state, auth.user.id, page, limit).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseCoursesListSuccess),
        data,
    ))
}
