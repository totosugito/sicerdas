use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::package_sections::list_section::list_section;
use crate::modules::exam::types::ListSectionBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    session: Option<AuthSession>,
    Json(body): Json<ListSectionBody>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = session.map(|s| s.user.id);
    let data = list_section(&state, locale.0, user_id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackageSectionsListSuccess),
        data,
    ))
}
