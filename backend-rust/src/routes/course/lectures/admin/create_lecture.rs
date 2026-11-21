use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::course::services::lectures::create_lecture::create_lecture;
use crate::modules::course::types::AdminCreateLectureBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(admin): RequireAdmin,
    Json(body): Json<AdminCreateLectureBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_lecture(&state, locale.0, admin.user.id, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::CourseLecturesCreateSuccess),
        data,
    ))
}
