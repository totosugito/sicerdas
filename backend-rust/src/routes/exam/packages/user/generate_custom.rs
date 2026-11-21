use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::packages::user_generate_custom::user_generate_custom;
use crate::modules::exam::types::GenerateCustomBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<GenerateCustomBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = user_generate_custom(&state, locale.0, auth.user.id, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::ExamPackagesGenerateCustomSuccess),
        data,
    ))
}
