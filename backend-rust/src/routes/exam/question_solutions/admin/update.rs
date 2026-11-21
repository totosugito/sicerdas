use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_solutions::update::update_question_solution;
use crate::modules::exam::types::UpdateQuestionSolutionBody;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
    Json,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateQuestionSolutionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_question_solution(&state, locale.0, id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamQuestionSolutionsUpdateSuccess),
        data,
    ))
}
