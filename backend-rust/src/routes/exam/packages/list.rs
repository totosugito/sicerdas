use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::packages::list_package::list_package;
use crate::modules::exam::types::PublicPackageListBody;
use crate::modules::exam::utils::get_latest_exam_version_id;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    session: Option<AuthSession>,
    Json(body): Json<PublicPackageListBody>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = session.map(|s| s.user.id);
    let latest_version_id = get_latest_exam_version_id(&state).await;
    let data = list_package(&state, user_id, latest_version_id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesListSuccess),
        data,
    ))
}
