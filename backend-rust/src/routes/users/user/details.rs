use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::users::services::user_details::get_user_details;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
) -> Result<impl IntoResponse, AppError> {
    let data = get_user_details(&state, auth.user.id, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::UserDetailsSuccess),
        data,
    ))
}
