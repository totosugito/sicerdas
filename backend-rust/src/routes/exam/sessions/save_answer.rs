use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::sessions::save_answer::save_answer;
use crate::modules::exam::types::SaveAnswerBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<SaveAnswerBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = save_answer(&state, locale.0, auth.user.id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSessionsSaveAnswerSuccess),
        data,
    ))
}
