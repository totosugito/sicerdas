use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, LocaleKey, RequestLocale};
use crate::modules::auth::services::email_otp;
use crate::modules::auth::types::{EmailOtpVerifyData, EmailOtpVerifyForgetPasswordBody};
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Extension, Json};

pub async fn handler(
    State(state): State<AppState>,
    Extension(RequestLocale(lang)): Extension<RequestLocale>,
    Json(body): Json<EmailOtpVerifyForgetPasswordBody>,
) -> Result<impl IntoResponse, AppError> {
    let valid = email_otp::verify_forget_password(&state, lang, &body.email, &body.otp).await?;
    Ok(ApiResponse::ok(
        translate(lang, LocaleKey::AuthValidOTP),
        EmailOtpVerifyData { valid },
    ))
}
