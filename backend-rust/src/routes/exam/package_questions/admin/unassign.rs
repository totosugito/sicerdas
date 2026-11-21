use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::package_questions::admin_unassign::admin_unassign;
use crate::modules::exam::types::UnassignPackageQuestionsBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<UnassignPackageQuestionsBody>,
) -> Result<impl IntoResponse, AppError> {
    admin_unassign(&state, body).await?;
    Ok(ApiResponse::<()>::msg(
        locale.t(LocaleKey::ExamPackageQuestionsUnassignSuccess),
    ))
}
