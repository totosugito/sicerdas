use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::questions::list::list_questions;
use crate::modules::exam::types::QuestionListBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<QuestionListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_questions(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamQuestionsListSuccess),
        data,
    ))
}
