use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_options::create::create_question_option;
use crate::modules::exam::types::CreateQuestionOptionBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<CreateQuestionOptionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_question_option(&state, locale.0, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::ExamQuestionOptionsCreateSuccess),
        data,
    ))
}
