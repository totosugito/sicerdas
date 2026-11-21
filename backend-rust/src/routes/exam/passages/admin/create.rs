use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::passages::create::create_passage;
use crate::modules::exam::types::CreatePassageBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(admin): RequireAdmin,
    Json(body): Json<CreatePassageBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = create_passage(&state, locale.0, admin.user.id, body).await?;
    Ok(ApiResponse::created(
        locale.t(LocaleKey::ExamPassagesCreateSuccess),
        data,
    ))
}
