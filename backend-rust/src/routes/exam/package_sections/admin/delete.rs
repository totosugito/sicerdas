use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::package_sections::admin_delete_section::admin_delete_section;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use serde_json::json;
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    admin_delete_section(&state, locale.0, id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackageSectionsDeleteSuccess),
        json!({}),
    ))
}
