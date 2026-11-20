use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::tier::services::delete_tier::delete_tier;
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
    delete_tier(&state, &slug, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::AppTierDeleteSuccess),
    ))
}
