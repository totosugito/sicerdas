use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::content_report::services::create_report::create_report;
use crate::modules::content_report::types::CreateReportBody;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, extract::State, Json};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: Option<AuthSession>,
    Json(body): Json<CreateReportBody>,
) -> Result<impl IntoResponse, AppError> {
    let reporter_id = auth.map(|a| a.user.id);
    let data = create_report(&state, body, reporter_id, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::ReportCreateSuccess),
        data,
    ))
}
