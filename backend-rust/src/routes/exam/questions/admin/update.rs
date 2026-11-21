use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::questions::update::update_question;
use crate::modules::exam::types::UpdateQuestionBody;
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
    Json(body): Json<UpdateQuestionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_question(&state, locale.0, id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamQuestionsUpdateSuccess),
        data,
    ))
}
