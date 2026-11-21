use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::package_sections::admin_detail_section::admin_detail_section;
use crate::modules::exam::utils::get_latest_exam_version_id;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let latest_version_id = get_latest_exam_version_id(&state).await;
    let data = admin_detail_section(&state, locale.0, id, latest_version_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackageSectionsDetailSuccess),
        data,
    ))
}
