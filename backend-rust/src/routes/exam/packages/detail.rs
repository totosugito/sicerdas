use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::packages::detail_package::detail_package;
use crate::modules::exam::utils::get_latest_exam_version_id;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    session: Option<AuthSession>,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = session.map(|s| s.user.id);
    let latest_version_id = get_latest_exam_version_id(&state).await;
    let data = detail_package(&state, locale.0, id, user_id, latest_version_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesDetailSuccess),
        data,
    ))
}
