use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_solutions::create::create_question_solution;
use crate::modules::exam::types::CreateQuestionSolutionBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<CreateQuestionSolutionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_question_solution(&state, locale.0, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::ExamQuestionSolutionsCreateSuccess),
        data,
    ))
}
