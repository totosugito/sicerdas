use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::app::services::app_latest::get_app_latest;
use crate::modules::app::types::AppLatestBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: Option<AuthSession>,
    Json(body): Json<AppLatestBody>,
) -> Result<impl IntoResponse, AppError> {
    let user_id = auth.map(|a| a.user.id);
    let data = get_app_latest(&state, body.db_version, user_id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::VersionLatestSuccess),
        data,
    ))
}
