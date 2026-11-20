use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::education::services::update_tag::update_tag;
use crate::modules::education::types::UpdateTagBody;
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
    Json(body): Json<UpdateTagBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_tag(&state, id, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationTagsUpdateSuccess),
        data,
    ))
}
