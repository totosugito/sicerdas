use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::ai::services::update_model::update_model;
use crate::modules::ai::types::ModelUpdateBody;
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
    Json(body): Json<ModelUpdateBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_model(&state, id, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ChatAiModelUpdateSuccess),
        data,
    ))
}
