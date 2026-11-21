use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_solutions::deletes::delete_multiple_question_solutions;
use crate::modules::exam::types::DeleteMultipleIdsBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<DeleteMultipleIdsBody>,
) -> Result<impl IntoResponse, AppError> {
    delete_multiple_question_solutions(&state, body.ids).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::ExamQuestionSolutionsDeleteSuccess),
    ))
}
