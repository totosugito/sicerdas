use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::services::list_grades::list_grades;
use crate::modules::education::types::GradeListBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<GradeListBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_grades(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationGradesListSuccess),
        data,
    ))
}
