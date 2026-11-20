use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::education::services::update_grade::update_grade;
use crate::modules::education::types::UpdateGradeBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
    Json,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Path(id): Path<i32>,
    Json(body): Json<UpdateGradeBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = update_grade(&state, id, body, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationGradesUpdateSuccess),
        data,
    ))
}
