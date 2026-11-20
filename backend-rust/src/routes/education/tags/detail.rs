use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::services::detail_tag::detail_tag;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    let data = detail_tag(&state, id, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationTagsDetailSuccess),
        data,
    ))
}
