use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::version::services::create_version::create_version;
use crate::modules::version::types::CreateVersionBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Json(body): Json<CreateVersionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_version(&state, body, locale).await?;
    Ok(ApiResponse::created(
            locale.t(LocaleKey::VersionCreateSuccess),
            data,
        ))
}
