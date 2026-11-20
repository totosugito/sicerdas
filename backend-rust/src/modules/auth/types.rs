use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthUser {
    pub id: Uuid,
    pub email: String,
    pub email_verified: bool,
    pub name: String,
    pub role: String,
    pub image: Option<String>,
    pub tier_id: String,
    pub show_ads: bool,
    pub banned: bool,
    pub ban_reason: Option<String>,
    pub ban_expires: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AuthSessionInfo {
    pub id: Uuid,
    pub user_id: Uuid,
    pub token: String,
    pub expires_at: String,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub impersonated_by: Option<Uuid>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GetSessionResponse {
    pub user: AuthUser,
    pub session: AuthSessionInfo,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SignInResponse {
    pub success: bool,
    pub message: String,
    pub token: String,
    pub user: AuthUser,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SignUpEmailBody {
    pub email: String,
    pub password: String,
    pub name: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailOtpForgetPasswordBody {
    pub email: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailOtpVerifyForgetPasswordBody {
    pub email: String,
    pub otp: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailOtpVerifyData {
    pub valid: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailOtpResetPasswordBody {
    pub email: String,
    pub otp: String,
    pub password: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct EmailHasOtpBody {
    pub email: String,
    pub identifier: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SocialIdTokenPayload {
    pub token: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SocialSignInBody {
    pub provider: String,
    pub id_token: Option<SocialIdTokenPayload>,
    #[serde(rename = "callbackURL")]
    pub callback_url: Option<String>,
}
