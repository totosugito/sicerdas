use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::questions::create::create_question;
use crate::modules::exam::types::CreateQuestionBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(admin): RequireAdmin,
    Json(body): Json<CreateQuestionBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_question(&state, locale.0, admin.user.id, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::ExamQuestionsCreateSuccess),
        data,
    ))
}
