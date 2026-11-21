use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::exam::services::passages::list_simple::list_passages_simple;
use crate::modules::exam::types::PassageSimpleBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    RequireAdmin(_admin): RequireAdmin,
    Json(body): Json<PassageSimpleBody>,
) -> Result<impl IntoResponse, AppError> {
    let data = list_passages_simple(&state, body).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ExamPassagesListSuccess),
        data,
    ))
}
