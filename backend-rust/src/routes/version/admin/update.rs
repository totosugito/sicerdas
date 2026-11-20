use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::version::services::update_version::update_version;
use crate::modules::version::types::UpdateVersionBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
    Json,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Path(id): Path<i32>,
    Json(body): Json<UpdateVersionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_version(&state, id, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::VersionUpdateSuccess),
        data,
    ))
}
