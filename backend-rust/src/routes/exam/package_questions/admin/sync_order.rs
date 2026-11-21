use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::package_questions::admin_sync_order::admin_sync_order;
use crate::modules::exam::types::SyncPackageQuestionsOrderBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<SyncPackageQuestionsOrderBody>,
) -> Result<impl IntoResponse, AppError> {
    admin_sync_order(&state, body).await?;
    Ok(ApiResponse::<()>::msg(
        locale.t(LocaleKey::ExamPackageQuestionsAssignSuccess),
    ))
}
