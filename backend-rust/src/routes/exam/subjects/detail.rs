use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::exam::services::subjects::detail::detail_subject;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Path, State},
    response::IntoResponse,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data = detail_subject(&state, locale.0, id).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSubjectsDetailSuccess),
        data,
    ))
}
