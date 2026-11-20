use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::tier::services::update_tier::update_tier;
use crate::modules::tier::types::UpdateTierBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
    Json,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Path(slug): Path<String>,
    Json(body): Json<UpdateTierBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_tier(&state, &slug, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::AppTierUpdateSuccess),
        data,
    ))
}
