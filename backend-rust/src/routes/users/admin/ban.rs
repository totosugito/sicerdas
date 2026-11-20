use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::ban_user::ban_user;
use crate::modules::users::types::BanUserBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    admin: RequireAdmin,
    Json(body): Json<BanUserBody>,
) -> Result<impl IntoResponse, AppError> {
    let banned = body.banned;
    ban_user(&state, admin.0.user.id, body, locale).await?;
    let msg_key = if banned {
        LocaleKey::UserUpdateSuccess
    } else {
        LocaleKey::UserUpdateSuccess
    };
    Ok(ApiResponse::msg(locale.t(msg_key)))
}
