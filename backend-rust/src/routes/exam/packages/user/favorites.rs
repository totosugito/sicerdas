use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::exam::services::packages::user_favorites::user_favorites;
use crate::modules::exam::types::FavoritesBody;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use serde_json::json;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    Json(body): Json<FavoritesBody>,
) -> Result<impl IntoResponse, AppError> {
    let (items, pagination) = user_favorites(&state, auth.user.id, body).await?;
    Ok((
        StatusCode::OK,
        Json(json!({
            "success": true,
            "message": locale.t(LocaleKey::ExamPackagesFavoritesSuccess),
            "data": items,
            "pagination": pagination
        })),
    ))
}
