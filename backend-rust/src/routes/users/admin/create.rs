use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::create_user::create_user;
use crate::modules::users::types::CreateUserBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Json(body): Json<CreateUserBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_user(&state, body, locale).await?;
    Ok(ApiResponse::created(
            locale.t(LocaleKey::UserCreateSuccess),
            data,
        ))
}
