use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::user_stats::get_user_stats;
use crate::modules::users::types::GetUserStatsQuery;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Query, State},
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Query(query): Query<GetUserStatsQuery>,
) -> Result<impl IntoResponse, AppError> {
    let data = get_user_stats(&state, query).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::UserListSuccess),
        data,
    ))
}
