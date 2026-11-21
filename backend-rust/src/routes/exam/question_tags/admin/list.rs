use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_tags::list::list_question_tags;
use crate::modules::exam::types::QuestionTagListBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<QuestionTagListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_question_tags(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamQuestionTagsListSuccess),
        data,
    ))
}
