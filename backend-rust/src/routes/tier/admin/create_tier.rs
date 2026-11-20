use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::tier::services::create_tier::create_tier;
use crate::modules::tier::types::CreateTierBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Json(body): Json<CreateTierBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_tier(&state, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::AppTierCreateSuccess),
        data,
    ))
}
