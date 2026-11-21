use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::exam::services::subjects::list::list_subjects;
use crate::modules::exam::types::SubjectListBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<SubjectListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_subjects(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSubjectsListSuccess),
        data,
    ))
}
