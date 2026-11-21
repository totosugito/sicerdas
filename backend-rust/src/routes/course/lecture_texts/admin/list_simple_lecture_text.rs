use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::lecture_texts::list_simple_lecture_text::list_simple_lecture_texts;
use crate::modules::course::types::LectureTextSimpleQuery;
use crate::types::response::ApiResponse;
use axum::{
    extract::{Query, State},
    response::IntoResponse,
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Query(query): Query<LectureTextSimpleQuery>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_simple_lecture_texts(&state, query).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::CourseLectureTextsListSuccess),
        data,
    ))
}
