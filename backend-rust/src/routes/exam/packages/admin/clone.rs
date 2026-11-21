use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::packages::admin_clone_package::admin_clone_package;
use crate::modules::exam::types::ClonePackageBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(admin): RequireAdmin,
    Json(body): Json<ClonePackageBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = admin_clone_package(&state, locale.0, admin.user.id, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::ExamPackagesCreateSuccess),
        data,
    ))
}
