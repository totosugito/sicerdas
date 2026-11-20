use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::version::services::delete_version::delete_version;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Path(id): Path<i32>,
) -> Result<impl IntoResponse, AppError> {
    delete_version(&state, id, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::VersionDeleteSuccess),
    ))
}
