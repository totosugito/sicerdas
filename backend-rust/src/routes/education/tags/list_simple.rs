use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::services::list_tags_simple::list_tags_simple;
use crate::modules::education::types::TagSimpleBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<TagSimpleBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_tags_simple(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationTagsListSuccess),
        data,
    ))
}
