use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::reset_password::reset_password;
use crate::modules::users::types::ResetPasswordBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Json(body): Json<ResetPasswordBody>,
) -> Result<impl IntoResponse, AppError> {
    reset_password(&state, body, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::UserPasswordUpdatedSuccessfully),
    ))
}
