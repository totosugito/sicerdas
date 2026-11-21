use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::subjects::update::update_subject;
use crate::modules::exam::types::UpdateSubjectBody;
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
    Json(body): Json<UpdateSubjectBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_subject(&state, locale.0, id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamSubjectsUpdateSuccess),
        data,
    ))
}
