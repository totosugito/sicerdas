use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::ai::services::detail_model::get_model_detail;
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
    let data = get_model_detail(&state, id, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ChatAiModelDetailSuccess),
        data,
    ))
}
