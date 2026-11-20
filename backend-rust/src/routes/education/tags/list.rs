use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::services::list_tags::list_tags;
use crate::modules::education::types::TagListBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<TagListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_tags(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationTagsListSuccess),
        data,
    ))
}
