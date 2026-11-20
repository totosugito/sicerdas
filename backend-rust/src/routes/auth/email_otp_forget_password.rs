use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, LocaleKey, RequestLocale};
use crate::modules::auth::services::email_otp;
use crate::modules::auth::types::EmailOtpForgetPasswordBody;
use crate::types::response::ApiResponse;
use axum::{extract::State, response::IntoResponse, Extension, Json};

pub async fn handler(
    State(state): State<AppState>,
    Extension(RequestLocale(lang)): Extension<RequestLocale>,
    Json(body): Json<EmailOtpForgetPasswordBody>,
) -> Result<impl IntoResponse, AppError> {
    email_otp::forget_password(&state, lang, &body.email).await?;
    Ok(ApiResponse::msg(translate(
        lang,
        LocaleKey::AuthPasswordResetOTPSent,
    )))
}
