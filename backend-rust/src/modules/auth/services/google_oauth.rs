use crate::app::AppState;
use crate::db::entities::{users, users_accounts, users_profiles};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::auth::crypto::generate_session_token;
use crate::modules::auth::services::session::create_session;
use crate::modules::auth::types::{AuthSessionInfo, AuthUser};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
struct GoogleTokenInfo {
    sub: String,
    email: String,
    email_verified: Option<String>,
    name: Option<String>,
    picture: Option<String>,
    aud: String,
}

#[derive(Debug, Deserialize)]
struct GoogleTokenExchangeResponse {
    access_token: String,
    id_token: Option<String>,
    refresh_token: Option<String>,
    expires_in: Option<i64>,
    scope: Option<String>,
}

#[derive(Debug, Deserialize)]
struct GoogleUserInfo {
    sub: String,
    email: String,
    email_verified: Option<bool>,
    name: Option<String>,
    picture: Option<String>,
}

pub async fn build_google_auth_url(
    state: &AppState,
    callback_url: Option<&str>,
) -> Result<String, AppError> {
    let client_id = state
        .config
        .google_web_client_id
        .as_deref()
        .ok_or_else(|| AppError::Internal("GOOGLE_WEB_CLIENT_ID not configured".to_string()))?;

    let oauth_state = generate_session_token();
    let redirect_after = callback_url
        .map(|s| s.trim())
        .filter(|s| !s.is_empty())
        .unwrap_or(&state.config.frontend_url)
        .to_string();

    state
        .oauth_state_cache
        .insert(oauth_state.clone(), redirect_after)
        .await;

    let redirect_uri = format!(
        "{}/api/auth/callback/google",
        state.config.api_url.trim_end_matches('/')
    );

    let mut url = url::Url::parse("https://accounts.google.com/o/oauth2/v2/auth")
        .map_err(|e| AppError::Internal(e.to_string()))?;
    url.query_pairs_mut()
        .append_pair("client_id", client_id)
        .append_pair("redirect_uri", &redirect_uri)
        .append_pair("response_type", "code")
        .append_pair("scope", "openid email profile")
        .append_pair("prompt", "select_account")
        .append_pair("state", &oauth_state);

    Ok(url.to_string())
}

pub async fn handle_google_callback(
    state: &AppState,
    lang: Lang,
    code: &str,
    oauth_state: &str,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<(AuthSessionInfo, String), AppError> {
    let redirect_after = state
        .oauth_state_cache
        .get(oauth_state)
        .await
        .ok_or_else(|| AppError::BadRequest("Invalid or expired OAuth state".to_string()))?;
    state.oauth_state_cache.invalidate(oauth_state).await;

    let client_id = state
        .config
        .google_web_client_id
        .as_deref()
        .ok_or_else(|| AppError::Internal("GOOGLE_WEB_CLIENT_ID not configured".to_string()))?;
    let client_secret = state
        .config
        .google_client_secret
        .as_deref()
        .ok_or_else(|| AppError::Internal("GOOGLE_CLIENT_SECRET not configured".to_string()))?;

    let redirect_uri = format!(
        "{}/api/auth/callback/google",
        state.config.api_url.trim_end_matches('/')
    );

    let token_res = state
        .http
        .post("https://oauth2.googleapis.com/token")
        .form(&[
            ("code", code),
            ("client_id", client_id),
            ("client_secret", client_secret),
            ("redirect_uri", redirect_uri.as_str()),
            ("grant_type", "authorization_code"),
        ])
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Google token exchange failed: {e}")))?;

    if !token_res.status().is_success() {
        let body = token_res.text().await.unwrap_or_default();
        return Err(AppError::BadRequest(format!(
            "Google token exchange rejected: {body}"
        )));
    }

    let tokens: GoogleTokenExchangeResponse = token_res
        .json()
        .await
        .map_err(|e| AppError::BadRequest(format!("Invalid Google token JSON: {e}")))?;

    let userinfo_res = state
        .http
        .get("https://www.googleapis.com/oauth2/v3/userinfo")
        .bearer_auth(&tokens.access_token)
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Google userinfo failed: {e}")))?;

    if !userinfo_res.status().is_success() {
        return Err(AppError::Unauthorized(translate(
            lang,
            LocaleKey::AuthInvalidCredentials,
        )));
    }

    let info: GoogleUserInfo = userinfo_res
        .json()
        .await
        .map_err(|e| AppError::BadRequest(format!("Invalid Google userinfo JSON: {e}")))?;

    let expires_at = tokens
        .expires_in
        .map(|secs| Utc::now().fixed_offset() + chrono::Duration::seconds(secs));

    let (session, _user) = upsert_google_user_and_session(
        state,
        lang,
        &info.sub,
        &info.email,
        info.email_verified.unwrap_or(false),
        info.name,
        info.picture,
        Some(tokens.access_token),
        tokens.refresh_token,
        tokens.id_token,
        expires_at,
        tokens.scope,
        ip_address,
        user_agent,
    )
    .await?;

    Ok((session, redirect_after))
}

pub async fn sign_in_with_google_id_token(
    state: &AppState,
    lang: Lang,
    id_token: &str,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<(AuthSessionInfo, AuthUser), AppError> {
    let res = state
        .http
        .get("https://oauth2.googleapis.com/tokeninfo")
        .query(&[("id_token", id_token)])
        .send()
        .await
        .map_err(|e| AppError::BadRequest(format!("Google token verification failed: {e}")))?;

    if !res.status().is_success() {
        return Err(AppError::Unauthorized(translate(
            lang,
            LocaleKey::AuthInvalidCredentials,
        )));
    }

    let info: GoogleTokenInfo = res
        .json()
        .await
        .map_err(|e| AppError::BadRequest(format!("Invalid Google tokeninfo response: {e}")))?;

    let allowed_audiences: Vec<&str> = [
        state.config.google_web_client_id.as_deref(),
        state.config.google_android_client_id.as_deref(),
        state.config.google_ios_client_id.as_deref(),
    ]
    .into_iter()
    .flatten()
    .collect();

    if !allowed_audiences.is_empty() && !allowed_audiences.contains(&info.aud.as_str()) {
        return Err(AppError::Unauthorized(translate(
            lang,
            LocaleKey::AuthInvalidCredentials,
        )));
    }

    upsert_google_user_and_session(
        state,
        lang,
        &info.sub,
        &info.email,
        info.email_verified.as_deref() == Some("true"),
        info.name,
        info.picture,
        None,
        None,
        Some(id_token.to_string()),
        None,
        Some("openid email profile".to_string()),
        ip_address,
        user_agent,
    )
    .await
}

#[allow(clippy::too_many_arguments)]
async fn upsert_google_user_and_session(
    state: &AppState,
    lang: Lang,
    sub: &str,
    raw_email: &str,
    email_verified: bool,
    name: Option<String>,
    picture: Option<String>,
    access_token: Option<String>,
    refresh_token: Option<String>,
    id_token: Option<String>,
    access_token_expires_at: Option<chrono::DateTime<chrono::FixedOffset>>,
    scope: Option<String>,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<(AuthSessionInfo, AuthUser), AppError> {
    let email = raw_email.trim().to_lowercase();
    let now = Utc::now().fixed_offset();

    let user = if let Some(existing) = users::Entity::find()
        .filter(users::Column::Email.eq(&email))
        .one(&state.db)
        .await?
    {
        if existing.banned {
            return Err(AppError::Forbidden(translate(
                lang,
                LocaleKey::AuthForbidden,
            )));
        }

        let mut user_active: users::ActiveModel = existing.clone().into();
        let mut user_changed = false;

        if existing.image.as_deref().unwrap_or("").trim().is_empty() {
            if let Some(pic) = picture.clone() {
                user_active.image = Set(Some(pic));
                user_changed = true;
            }
        }
        if !existing.email_verified && email_verified {
            user_active.email_verified = Set(true);
            user_changed = true;
        }
        if existing.name.trim().is_empty() {
            if let Some(n) = name.clone().filter(|s| !s.trim().is_empty()) {
                user_active.name = Set(n);
                user_changed = true;
            }
        }

        let updated_user = if user_changed {
            user_active.updated_at = Set(now);
            user_active.update(&state.db).await?
        } else {
            existing.clone()
        };

        if let Some(existing_account) = users_accounts::Entity::find()
            .filter(users_accounts::Column::UserId.eq(existing.id))
            .filter(users_accounts::Column::ProviderId.eq("google"))
            .one(&state.db)
            .await?
        {
            let mut acc_active: users_accounts::ActiveModel = existing_account.clone().into();
            if access_token.is_some() {
                acc_active.access_token = Set(access_token);
            }
            if refresh_token.is_some() {
                acc_active.refresh_token = Set(refresh_token);
            }
            if id_token.is_some() {
                acc_active.id_token = Set(id_token);
            }
            if access_token_expires_at.is_some() {
                acc_active.access_token_expires_at = Set(access_token_expires_at);
            }
            if scope.is_some() {
                acc_active.scope = Set(scope);
            }
            acc_active.updated_at = Set(now);
            acc_active.update(&state.db).await?;
        } else {
            users_accounts::ActiveModel {
                id: Set(Uuid::new_v4()),
                account_id: Set(sub.to_string()),
                provider_id: Set("google".to_string()),
                user_id: Set(existing.id),
                access_token: Set(access_token),
                refresh_token: Set(refresh_token),
                id_token: Set(id_token),
                access_token_expires_at: Set(access_token_expires_at),
                refresh_token_expires_at: Set(None),
                scope: Set(scope),
                password: Set(None),
                created_at: Set(now),
                updated_at: Set(now),
            }
            .insert(&state.db)
            .await?;
        }

        if users_profiles::Entity::find_by_id(existing.id)
            .one(&state.db)
            .await?
            .is_none()
        {
            users_profiles::ActiveModel {
                id: Set(existing.id),
                school: Set(None),
                grade: Set(None),
                phone: Set(None),
                address: Set(None),
                bio: Set(None),
                date_of_birth: Set(None),
                tier_id: Set(Some("free".to_string())),
                extra: Set(Some(serde_json::json!({}))),
                created_at: Set(now),
                updated_at: Set(now),
            }
            .insert(&state.db)
            .await?;
        }

        updated_user
    } else {
        let user_id = Uuid::new_v4();
        let display_name = name
            .unwrap_or_else(|| email.split('@').next().unwrap_or("User").to_string());

        let txn = state.db.begin().await?;

        let created = users::ActiveModel {
            id: Set(user_id),
            email: Set(email),
            email_verified: Set(email_verified),
            name: Set(display_name),
            role: Set(users::UserRole::User),
            image: Set(picture),
            created_at: Set(now),
            updated_at: Set(now),
            banned: Set(false),
            ban_reason: Set(None),
            ban_expires: Set(None),
        }
        .insert(&txn)
        .await?;

        users_accounts::ActiveModel {
            id: Set(Uuid::new_v4()),
            account_id: Set(sub.to_string()),
            provider_id: Set("google".to_string()),
            user_id: Set(user_id),
            access_token: Set(access_token),
            refresh_token: Set(refresh_token),
            id_token: Set(id_token),
            access_token_expires_at: Set(access_token_expires_at),
            refresh_token_expires_at: Set(None),
            scope: Set(scope),
            password: Set(None),
            created_at: Set(now),
            updated_at: Set(now),
        }
        .insert(&txn)
        .await?;

        users_profiles::ActiveModel {
            id: Set(user_id),
            school: Set(None),
            grade: Set(None),
            phone: Set(None),
            address: Set(None),
            bio: Set(None),
            date_of_birth: Set(None),
            tier_id: Set(Some("free".to_string())),
            extra: Set(Some(serde_json::json!({}))),
            created_at: Set(now),
            updated_at: Set(now),
        }
        .insert(&txn)
        .await?;

        txn.commit().await?;
        created
    };

    create_session(state, &user, ip_address, user_agent).await
}
