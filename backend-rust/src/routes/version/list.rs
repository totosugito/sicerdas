use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::version::services::list_version::list_versions;
use crate::modules::version::types::ListVersionBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<ListVersionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_versions(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::VersionListSuccess),
        data,
    ))
}
