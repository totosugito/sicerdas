use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::tier::services::get_tier::get_tier;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, AppError> {
    let data = get_tier(&state, &slug, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::AppTierDetailsFound),
        data,
    ))
}
