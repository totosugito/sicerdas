use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::packages::admin_list_package_simple::admin_list_package_simple;
use crate::modules::exam::types::PackageSimpleBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<PackageSimpleBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = admin_list_package_simple(&state, true, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesListSimpleSuccess),
        data,
    ))
}
