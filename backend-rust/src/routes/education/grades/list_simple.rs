use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::education::services::list_grades_simple::list_grades_simple;
use crate::modules::education::types::GradeSimpleBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Json(body): Json<GradeSimpleBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_grades_simple(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::EducationGradesListSuccess),
        data,
    ))
}
