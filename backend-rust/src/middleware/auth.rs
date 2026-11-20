use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey, RequestLocale};
use crate::modules::auth::crypto::verify_signed_cookie_value;
use crate::modules::auth::services::session::get_session_by_token;
use crate::modules::auth::types::{AuthSessionInfo, AuthUser};
use axum::{
    extract::{FromRequestParts, OptionalFromRequestParts},
    http::{header, request::Parts},
};
use axum_extra::extract::CookieJar;

#[derive(Debug, Clone)]
pub struct AuthSession {
    pub user: AuthUser,
    pub session: AuthSessionInfo,
}

#[derive(Debug, Clone)]
pub struct RequireAdmin(pub AuthSession);

fn extract_token(parts: &Parts, state: &AppState) -> Option<String> {
    if let Some(auth_header) = parts
        .headers
        .get(header::AUTHORIZATION)
        .and_then(|v| v.to_str().ok())
    {
        if let Some(token) = auth_header.strip_prefix("Bearer ") {
            let trimmed = token.trim();
            if !trimmed.is_empty() {
                return Some(trimmed.to_string());
            }
        }
    }

    let jar = CookieJar::from_headers(&parts.headers);
    let cookie_name = format!("{}.session_token", state.config.cookie_prefix);
    if let Some(cookie) = jar.get(&cookie_name) {
        if let Some(raw_token) =
            verify_signed_cookie_value(cookie.value(), &state.config.better_auth_secret)
        {
            return Some(raw_token);
        }
    }

    None
}

impl FromRequestParts<AppState> for AuthSession {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let lang = parts
            .extensions
            .get::<RequestLocale>()
            .map(|r| r.0)
            .unwrap_or(Lang::Id);

        let token = extract_token(parts, state)
            .ok_or_else(|| AppError::Unauthorized(translate(lang, LocaleKey::AuthUnauthorized)))?;

        let data = get_session_by_token(state, &token)
            .await?
            .ok_or_else(|| AppError::Unauthorized(translate(lang, LocaleKey::AuthUnauthorized)))?;

        Ok(AuthSession {
            user: data.user,
            session: data.session,
        })
    }
}

impl OptionalFromRequestParts<AppState> for AuthSession {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Option<Self>, Self::Rejection> {
        let Some(token) = extract_token(parts, state) else {
            return Ok(None);
        };
        let Some(data) = get_session_by_token(state, &token).await? else {
            return Ok(None);
        };
        Ok(Some(AuthSession {
            user: data.user,
            session: data.session,
        }))
    }
}

impl FromRequestParts<AppState> for RequireAdmin {
    type Rejection = AppError;

    async fn from_request_parts(
        parts: &mut Parts,
        state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        let lang = parts
            .extensions
            .get::<RequestLocale>()
            .map(|r| r.0)
            .unwrap_or(Lang::Id);

        let session = <AuthSession as FromRequestParts<AppState>>::from_request_parts(parts, state).await?;
        if session.user.role != "admin" {
            return Err(AppError::Forbidden(translate(
                lang,
                LocaleKey::AuthForbidden,
            )));
        }

        Ok(RequireAdmin(session))
    }
}
