use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::packages::user_rating::user_rating;
use crate::modules::exam::types::RatingBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<RatingBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = user_rating(&state, locale.0, auth.user.id, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPackagesRatingUpdated),
        data,
    ))
}
