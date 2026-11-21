use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::lecture_texts::create_lecture_text::create_lecture_text;
use crate::modules::course::types::AdminCreateLectureTextBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(admin): RequireAdmin,
    Json(body): Json<AdminCreateLectureTextBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_lecture_text(&state, admin.user.id, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::CourseLectureTextsCreateSuccess),
        data,
    ))
}
