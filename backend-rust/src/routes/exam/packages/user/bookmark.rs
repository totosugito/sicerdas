use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::packages::user_bookmark::user_bookmark;
use crate::modules::exam::types::BookmarkBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<BookmarkBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = user_bookmark(&state, locale.0, auth.user.id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesBookmarkUpdated),
        data,
    ))
}
