use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::education::services::create_grade::create_grade;
use crate::modules::education::types::CreateGradeBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    admin: RequireAdmin,
    Json(body): Json<CreateGradeBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_grade(&state, admin.0.user.id, body, locale).await?;
    Ok(ApiResponse::created(
            locale.t(LocaleKey::EducationGradesCreateSuccess),
            data,
        ))
}
