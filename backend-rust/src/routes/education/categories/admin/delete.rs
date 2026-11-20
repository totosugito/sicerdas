use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::education::services::delete_category::delete_category;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    delete_category(&state, id, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::EducationCategoriesDeleteSuccess),
    ))
}
