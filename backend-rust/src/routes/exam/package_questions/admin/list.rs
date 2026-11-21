use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::package_questions::admin_list::admin_list;
use crate::modules::exam::types::PackageQuestionListBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<PackageQuestionListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = admin_list(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackageQuestionsListSuccess),
        data,
    ))
}
