pub mod callback_google;
pub mod email_has_otp;
pub mod email_otp_forget_password;
pub mod email_otp_reset_password;
pub mod email_otp_verify_forget_password;
pub mod get_session;
pub mod revoke_other_sessions;
pub mod sign_in_email;
pub mod sign_in_social;
pub mod sign_out;
pub mod sign_up_email;

use crate::app::AppState;
use axum::{
    routing::{get, post},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/sign-in-email", post(sign_in_email::handler))
        .route("/sign-in/email", post(sign_in_email::handler))
        .route("/get-session", get(get_session::handler))
        .route("/sign-out", post(sign_out::handler))
        .route("/sign-up/email", post(sign_up_email::handler))
        .route("/revoke-other-sessions", post(revoke_other_sessions::handler))
        .route(
            "/email-otp-forget-password",
            post(email_otp_forget_password::handler),
        )
        .route(
            "/email-otp-verify-forget-password",
            post(email_otp_verify_forget_password::handler),
        )
        .route(
            "/email-otp-reset-password",
            post(email_otp_reset_password::handler),
        )
        .route("/email-has-otp", post(email_has_otp::handler))
        .route("/sign-in/social", post(sign_in_social::handler))
        .route("/callback/google", get(callback_google::handler))
}
