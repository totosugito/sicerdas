use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, LocaleKey, RequestLocale};
use crate::modules::auth::services::email_otp;
use crate::modules::auth::types::EmailHasOtpBody;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Extension, Json};
use serde::Serialize;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct EmailHasOtpResponse {
    success: bool,
    has_otp: bool,
    message: String,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(RequestLocale(lang)): Extension<RequestLocale>,
    Json(body): Json<EmailHasOtpBody>,
) -> Result<impl IntoResponse, AppError> {
    let has_otp =
        email_otp::has_otp(&state, lang, &body.email, body.identifier.as_deref()).await?;
    let msg_key = if has_otp {
        LocaleKey::AuthPendingVerificationFound
    } else {
        LocaleKey::AuthNoPendingVerification
    };
    Ok((
        StatusCode::OK,
        Json(EmailHasOtpResponse {
            success: true,
            has_otp,
            message: translate(lang, msg_key),
        }),
    ))
}
