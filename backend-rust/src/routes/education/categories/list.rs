use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::services::list_categories::list_categories;
use crate::modules::education::types::CategoryListBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<CategoryListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_categories(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationCategoriesListSuccess),
        data,
    ))
}
