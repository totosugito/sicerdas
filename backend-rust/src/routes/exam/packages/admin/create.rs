use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::packages::admin_create_package::admin_create_package;
use crate::modules::exam::types::CreatePackageBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};
use serde_json::json;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(admin): RequireAdmin,
    Json(body): Json<CreatePackageBody>,
) -> Result<impl IntoResponse, AppError> {
    let id = admin_create_package(&state, locale.0, admin.user.id, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::ExamPackagesCreateSuccess),
        json!({ "id": id }),
    ))
}
