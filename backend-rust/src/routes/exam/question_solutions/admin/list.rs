use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_solutions::list::list_question_solutions;
use crate::modules::exam::types::QuestionSolutionListBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<QuestionSolutionListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_question_solutions(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamQuestionSolutionsListSuccess),
        data,
    ))
}
