use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::package_sections::admin_list_section::admin_list_section;
use crate::modules::exam::types::AdminSectionListBody;
use crate::modules::exam::utils::get_latest_exam_version_id;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<AdminSectionListBody>,
) -> Result<impl IntoResponse, AppError> {
    let latest_version_id = get_latest_exam_version_id(&state).await;
    let data = admin_list_section(&state, locale.0, true, latest_version_id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackageSectionsListSuccess),
        data,
    ))
}
