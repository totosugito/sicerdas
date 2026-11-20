use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::delete_user::bulk_delete_users;
use crate::modules::users::types::BulkDeleteUsersBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Json(body): Json<BulkDeleteUsersBody>,
) -> Result<impl IntoResponse, AppError> {
    bulk_delete_users(&state, body.ids, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::UserDeleteSuccess),
    ))
}
