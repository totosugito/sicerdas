use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_options::deletes::delete_multiple_question_options;
use crate::modules::exam::types::DeleteMultipleIdsBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<DeleteMultipleIdsBody>,
) -> Result<impl IntoResponse, AppError> {
    delete_multiple_question_options(&state, body.ids).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::ExamQuestionOptionsDeleteSuccess),
    ))
}
