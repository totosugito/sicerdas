use crate::app::AppState;
use crate::config::AppConfig;
use crate::db::entities::users::{users, users_profiles, users_sessions};
use crate::error::AppError;
use crate::locales::{tr, LocaleKey};
use crate::modules::auth::crypto::{generate_session_token, sign_cookie_value};
use crate::modules::auth::types::{AuthSessionInfo, AuthUser, GetSessionResponse};
use axum_extra::extract::cookie::{Cookie, SameSite};
use chrono::{Duration, Utc};
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub fn resolve_avatar_url(config: &AppConfig, avatar_path: Option<&str>) -> Option<String> {
    let raw = avatar_path?.trim();
    if raw.is_empty() {
        return None;
    }
    if raw.starts_with("http://") || raw.starts_with("https://") {
        return Some(raw.to_string());
    }
    let clean = raw.trim_start_matches('/');
    let uploads_dir = config.upload_dir.trim_matches('/');
    if config.use_s3_storage {
        if let Some(s3_url) = config.s3_public_url.as_deref() {
            return Some(format!(
                "{}/{}/{}",
                s3_url.trim_end_matches('/'),
                uploads_dir,
                clean
            ));
        }
    }
    Some(format!(
        "{}/{}/{}",
        config.api_url.trim_end_matches('/'),
        uploads_dir,
        clean
    ))
}

pub async fn build_auth_user(
    state: &AppState,
    user: &users::Model,
) -> Result<AuthUser, AppError> {
    let profile = users_profiles::Entity::find_by_id(user.id)
        .one(&state.db)
        .await?;

    let tier_id = profile
        .and_then(|p| p.tier_id)
        .unwrap_or_else(|| "free".to_string());
    let show_ads = tier_id == "free";

    Ok(AuthUser {
        id: user.id,
        email: user.email.clone(),
        email_verified: user.email_verified,
        name: user.name.clone(),
        role: user.role.as_str().to_string(),
        image: resolve_avatar_url(&state.config, user.image.as_deref()),
        tier_id,
        show_ads,
        banned: user.banned,
        ban_reason: user.ban_reason.clone(),
        ban_expires: user.ban_expires.map(|d| d.to_rfc3339()),
        created_at: user.created_at.to_rfc3339(),
        updated_at: user.updated_at.to_rfc3339(),
    })
}

pub async fn create_session(
    state: &AppState,
    user: &users::Model,
    ip_address: Option<String>,
    user_agent: Option<String>,
) -> Result<(AuthSessionInfo, AuthUser), AppError> {
    let now = Utc::now().fixed_offset();
    let expires_at = now + Duration::days(7);
    let token = generate_session_token();
    let session_id = Uuid::new_v4();

    let model = users_sessions::ActiveModel {
        id: Set(session_id),
        expires_at: Set(expires_at),
        token: Set(token.clone()),
        created_at: Set(now),
        updated_at: Set(now),
        ip_address: Set(ip_address.clone()),
        user_agent: Set(user_agent.clone()),
        user_id: Set(user.id),
        impersonated_by: Set(None),
    };
    let inserted = model.insert(&state.db).await?;
    let auth_user = build_auth_user(state, user).await?;

    let session_info = AuthSessionInfo {
        id: inserted.id,
        user_id: inserted.user_id,
        token: inserted.token,
        expires_at: inserted.expires_at.to_rfc3339(),
        ip_address: inserted.ip_address,
        user_agent: inserted.user_agent,
        impersonated_by: inserted.impersonated_by,
        created_at: inserted.created_at.to_rfc3339(),
        updated_at: inserted.updated_at.to_rfc3339(),
    };

    Ok((session_info, auth_user))
}

pub async fn get_session_by_token(
    state: &AppState,
    token: &str,
) -> Result<Option<GetSessionResponse>, AppError> {
    if let Some(cached) = state.session_cache.get(token).await {
        if let Ok(parsed) = serde_json::from_value::<GetSessionResponse>(cached) {
            return Ok(Some(parsed));
        }
    }

    let Some(session) = users_sessions::Entity::find()
        .filter(users_sessions::Column::Token.eq(token))
        .one(&state.db)
        .await?
    else {
        return Ok(None);
    };

    if session.expires_at < Utc::now().fixed_offset() {
        let _ = users_sessions::Entity::delete_by_id(session.id)
            .exec(&state.db)
            .await;
        return Ok(None);
    }

    let Some(user) = users::Entity::find_by_id(session.user_id)
        .one(&state.db)
        .await?
    else {
        return Ok(None);
    };

    if user.banned {
        return Err(AppError::Forbidden(tr(LocaleKey::AuthForbidden)));
    }

    let auth_user = build_auth_user(state, &user).await?;
    let res = GetSessionResponse {
        user: auth_user,
        session: AuthSessionInfo {
            id: session.id,
            user_id: session.user_id,
            token: session.token.clone(),
            expires_at: session.expires_at.to_rfc3339(),
            ip_address: session.ip_address,
            user_agent: session.user_agent,
            impersonated_by: session.impersonated_by,
            created_at: session.created_at.to_rfc3339(),
            updated_at: session.updated_at.to_rfc3339(),
        },
    };

    if let Ok(val) = serde_json::to_value(&res) {
        state.session_cache.insert(token.to_string(), val).await;
    }

    Ok(Some(res))
}

pub async fn revoke_session_by_token(state: &AppState, token: &str) -> Result<(), AppError> {
    users_sessions::Entity::delete_many()
        .filter(users_sessions::Column::Token.eq(token))
        .exec(&state.db)
        .await?;
    state.session_cache.invalidate(token).await;
    Ok(())
}

pub async fn revoke_other_sessions(
    state: &AppState,
    user_id: Uuid,
    current_token: &str,
) -> Result<(), AppError> {
    let others = users_sessions::Entity::find()
        .filter(users_sessions::Column::UserId.eq(user_id))
        .filter(users_sessions::Column::Token.ne(current_token))
        .all(&state.db)
        .await?;

    for s in &others {
        state.session_cache.invalidate(&s.token).await;
    }

    users_sessions::Entity::delete_many()
        .filter(users_sessions::Column::UserId.eq(user_id))
        .filter(users_sessions::Column::Token.ne(current_token))
        .exec(&state.db)
        .await?;

    Ok(())
}

pub fn build_session_cookie<'a>(config: &AppConfig, token: &str) -> Cookie<'a> {
    let name = format!("{}.session_token", config.cookie_prefix);
    let signed = sign_cookie_value(token, &config.better_auth_secret);
    let mut cookie = Cookie::build((name, signed))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .max_age(time::Duration::days(7));

    if let Some(domain) = cookie_domain(&config.frontend_url) {
        cookie = cookie.domain(domain);
    }

    cookie.build()
}

pub fn clear_session_cookie<'a>(config: &AppConfig) -> Cookie<'a> {
    let name = format!("{}.session_token", config.cookie_prefix);
    let mut cookie = Cookie::build((name, ""))
        .path("/")
        .http_only(true)
        .same_site(SameSite::Lax)
        .max_age(time::Duration::seconds(0));

    if let Some(domain) = cookie_domain(&config.frontend_url) {
        cookie = cookie.domain(domain);
    }

    cookie.build()
}

fn cookie_domain(frontend_url: &str) -> Option<String> {
    let host = frontend_url
        .trim_start_matches("http://")
        .trim_start_matches("https://")
        .split(':')
        .next()
        .unwrap_or("")
        .trim();

    let is_ip = host.split('.').count() == 4 && host.split('.').all(|p| p.parse::<u8>().is_ok());
    if host.is_empty() || host == "localhost" || is_ip {
        None
    } else {
        Some(format!(".{host}"))
    }
}
