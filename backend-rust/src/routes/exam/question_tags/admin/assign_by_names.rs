use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_tags::assign_by_names::assign_question_tags_by_names;
use crate::modules::exam::types::AssignQuestionTagsByNameBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<AssignQuestionTagsByNameBody>,
) -> Result<impl IntoResponse, AppError> {
    assign_question_tags_by_names(&state, body).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::ExamQuestionTagsAssignSuccess),
    ))
}
