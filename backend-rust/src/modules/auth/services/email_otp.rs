use crate::app::AppState;
use crate::db::entities::{users, users_accounts, users_verifications};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::auth::crypto::{generate_otp_code, hash_password};
use crate::platform::email::{render_reset_otp_email, send_resend_email};
use chrono::{Duration, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, QueryOrder, Set};
use uuid::Uuid;

pub async fn forget_password(
    state: &AppState,
    lang: Lang,
    email: &str,
) -> Result<(), AppError> {
    let email = email.trim().to_lowercase();
    if email.is_empty() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::AuthEmailRequired)));
    }

    let Some(user) = users::Entity::find()
        .filter(users::Column::Email.eq(&email))
        .one(&state.db)
        .await?
    else {
        return Err(AppError::NotFound(translate(lang, LocaleKey::AuthUserNotFound)));
    };

    let identifier = format!("forget-password-otp-{email}");
    let window_secs = (state.config.password_reset_rate_limit_window_ms / 1000) as i64;
    let window_start = Utc::now().fixed_offset() - Duration::seconds(window_secs.max(60));

    let recent = users_verifications::Entity::find()
        .filter(users_verifications::Column::Identifier.eq(&identifier))
        .filter(users_verifications::Column::CreatedAt.gte(window_start))
        .all(&state.db)
        .await?;

    if recent.len() >= state.config.password_reset_rate_limit as usize {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthPasswordResetRateLimitExceeded,
        )));
    }

    let otp = generate_otp_code();
    let now = Utc::now().fixed_offset();
    let expires_at = now + Duration::hours(1);

    users_verifications::ActiveModel {
        id: Set(Uuid::new_v4()),
        identifier: Set(identifier),
        value: Set(format!("{otp}:0")),
        expires_at: Set(expires_at),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&state.db)
    .await?;

    let html = render_reset_otp_email(&user.email, &otp);
    if let Err(err) = send_resend_email(
        &state.http,
        &state.config,
        &user.email,
        "Kode OTP Reset Kata Sandi",
        html,
    )
    .await
    {
        tracing::error!(error = %err, email = %user.email, "Failed to send OTP email via Resend");
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthPasswordResetOTPFailed,
        )));
    }

    Ok(())
}

pub async fn verify_forget_password(
    state: &AppState,
    lang: Lang,
    email: &str,
    otp: &str,
) -> Result<bool, AppError> {
    let email = email.trim().to_lowercase();
    let otp = otp.trim();
    if email.is_empty() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::AuthEmailRequired)));
    }
    if otp.is_empty() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::AuthOtpRequired)));
    }

    let identifier = format!("forget-password-otp-{email}");
    let Some(verification) = users_verifications::Entity::find()
        .filter(users_verifications::Column::Identifier.eq(&identifier))
        .order_by_desc(users_verifications::Column::UpdatedAt)
        .one(&state.db)
        .await?
    else {
        return Err(AppError::NotFound(translate(lang, LocaleKey::AuthInvalidOTP)));
    };

    if !verification.value.starts_with(&format!("{otp}:")) {
        return Err(AppError::NotFound(translate(lang, LocaleKey::AuthInvalidOTP)));
    }

    if verification.expires_at < Utc::now().fixed_offset() {
        return Err(AppError::NotFound(translate(lang, LocaleKey::AuthExpiredOTP)));
    }

    Ok(true)
}

pub async fn reset_password(
    state: &AppState,
    lang: Lang,
    email: &str,
    otp: &str,
    new_password: &str,
) -> Result<(), AppError> {
    let email = email.trim().to_lowercase();
    let otp = otp.trim();
    if email.is_empty() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::AuthEmailRequired)));
    }
    if otp.is_empty() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::AuthOtpRequired)));
    }
    if new_password.is_empty() {
        return Err(AppError::BadRequest(translate(
            lang,
            LocaleKey::AuthPasswordRequired,
        )));
    }

    let Some(user) = users::Entity::find()
        .filter(users::Column::Email.eq(&email))
        .one(&state.db)
        .await?
    else {
        return Err(AppError::NotFound(translate(lang, LocaleKey::AuthUserNotFound)));
    };

    verify_forget_password(state, lang, &email, otp).await?;

    let password_hash =
        hash_password(new_password).map_err(|e| AppError::Internal(format!("Hash error: {e}")))?;
    let now = Utc::now().fixed_offset();

    if let Some(account) = users_accounts::Entity::find()
        .filter(users_accounts::Column::UserId.eq(user.id))
        .filter(users_accounts::Column::ProviderId.eq("credential"))
        .one(&state.db)
        .await?
    {
        let mut active: users_accounts::ActiveModel = account.into();
        active.password = Set(Some(password_hash));
        active.updated_at = Set(now);
        active.update(&state.db).await?;
    } else {
        users_accounts::ActiveModel {
            id: Set(Uuid::new_v4()),
            account_id: Set(user.id.to_string()),
            provider_id: Set("credential".to_string()),
            user_id: Set(user.id),
            access_token: Set(None),
            refresh_token: Set(None),
            id_token: Set(None),
            access_token_expires_at: Set(None),
            refresh_token_expires_at: Set(None),
            scope: Set(None),
            password: Set(Some(password_hash)),
            created_at: Set(now),
            updated_at: Set(now),
        }
        .insert(&state.db)
        .await?;
    }

    let identifier = format!("forget-password-otp-{email}");
    users_verifications::Entity::delete_many()
        .filter(users_verifications::Column::Identifier.eq(&identifier))
        .exec(&state.db)
        .await?;

    Ok(())
}

pub async fn has_otp(
    state: &AppState,
    lang: Lang,
    email: &str,
    prefix: Option<&str>,
) -> Result<bool, AppError> {
    let email = email.trim().to_lowercase();
    if email.is_empty() {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::AuthEmailRequired)));
    }

    let exists = users::Entity::find()
        .filter(users::Column::Email.eq(&email))
        .one(&state.db)
        .await?
        .is_some();

    if !exists {
        return Err(AppError::NotFound(translate(lang, LocaleKey::AuthUserNotFound)));
    }

    let identifier_prefix = prefix.unwrap_or("forget-password-otp-");
    let identifier = format!("{identifier_prefix}{email}");

    let pending = users_verifications::Entity::find()
        .filter(users_verifications::Column::Identifier.eq(&identifier))
        .filter(users_verifications::Column::ExpiresAt.gte(Utc::now().fixed_offset()))
        .one(&state.db)
        .await?
        .is_some();

    Ok(pending)
}
