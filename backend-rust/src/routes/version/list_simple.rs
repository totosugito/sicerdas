use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::version::services::list_version_simple::list_versions_simple;
use crate::modules::version::types::ListVersionSimpleBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<ListVersionSimpleBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_versions_simple(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::VersionListSuccess),
        data,
    ))
}
