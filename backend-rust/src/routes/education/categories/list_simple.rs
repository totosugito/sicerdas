use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::services::list_categories_simple::list_categories_simple;
use crate::modules::education::types::CategorySimpleBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<CategorySimpleBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_categories_simple(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationCategoriesListSuccess),
        data,
    ))
}
