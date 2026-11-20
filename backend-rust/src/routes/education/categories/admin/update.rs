use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::education::services::update_category::update_category;
use crate::modules::education::types::UpdateCategoryBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
    Json,
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
    Json(body): Json<UpdateCategoryBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_category(&state, id, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationCategoriesUpdateSuccess),
        data,
    ))
}
