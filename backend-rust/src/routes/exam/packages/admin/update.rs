use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::packages::admin_update_package::admin_update_package;
use crate::modules::exam::types::UpdatePackageBody;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use serde_json::json;
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdatePackageBody>,
) -> Result<impl IntoResponse, AppError> {
    admin_update_package(&state, locale.0, id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesUpdateSuccess),
        json!({ "id": id }),
    ))
}
