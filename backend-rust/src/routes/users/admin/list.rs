use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::list_users::list_users;
use crate::modules::users::types::ListUsersBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Json(body): Json<ListUsersBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_users(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::UserListSuccess),
        data,
    ))
}
