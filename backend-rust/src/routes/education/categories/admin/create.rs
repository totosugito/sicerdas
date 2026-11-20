use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::education::services::create_category::create_category;
use crate::modules::education::types::CreateCategoryBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    admin: RequireAdmin,
    Json(body): Json<CreateCategoryBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_category(&state, admin.0.user.id, body, locale).await?;
    Ok(ApiResponse::created(
            locale.t(LocaleKey::EducationCategoriesCreateSuccess),
            data,
        ))
}
