use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::packages::admin_list_package::admin_list_package;
use crate::modules::exam::types::AdminPackageListBody;
use crate::modules::exam::utils::get_latest_exam_version_id;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<AdminPackageListBody>,
) -> Result<impl IntoResponse, AppError> {
    let latest_version_id = get_latest_exam_version_id(&state).await;
    let data = admin_list_package(&state, true, latest_version_id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesListSuccess),
        data,
    ))
}
