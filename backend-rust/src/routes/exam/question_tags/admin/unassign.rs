use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_tags::unassign::unassign_question_tags;
use crate::modules::exam::types::AssignQuestionTagsBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<AssignQuestionTagsBody>,
) -> Result<impl IntoResponse, AppError> {
    unassign_question_tags(&state, body).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::ExamQuestionTagsUnassignSuccess),
    ))
}
