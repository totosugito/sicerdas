use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::users::services::change_password::change_password;
use crate::modules::users::types::ChangePasswordBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<ChangePasswordBody>,
) -> Result<impl IntoResponse, AppError> {
    change_password(&state, auth.user.id, body, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::UserPasswordUpdatedSuccessfully),
    ))
}
