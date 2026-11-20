use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::version::services::detail_version::get_version_detail;
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
    let data = get_version_detail(&state, id, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::VersionDetailSuccess),
        data,
    ))
}
