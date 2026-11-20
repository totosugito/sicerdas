use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::update_user::update_user;
use crate::modules::users::types::UpdateUserBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Json(body): Json<UpdateUserBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_user(&state, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::UserUpdateSuccess),
        data,
    ))
}
