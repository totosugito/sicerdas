use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::question_options::delete::delete_question_option;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    delete_question_option(&state, locale.0, id).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::ExamQuestionOptionsDeleteSuccess),
    ))
}
