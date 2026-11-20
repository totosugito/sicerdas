use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey, RequestLocale};
use crate::modules::auth::services::{session::build_session_cookie, sign_in_email};
use crate::modules::auth::types::SignInResponse;
use axum::{
    body::Bytes,
    extract::{Multipart, State},
    http::{header, HeaderMap, StatusCode},
    response::IntoResponse,
    Extension, Json,
};
use axum_extra::extract::CookieJar;
use serde::Deserialize;

#[derive(Deserialize)]
struct JsonLoginBody {
    email: Option<String>,
    password: Option<String>,
}

pub async fn handler(
    State(state): State<AppState>,
    Extension(RequestLocale(lang)): Extension<RequestLocale>,
    headers: HeaderMap,
    jar: CookieJar,
    req: axum::extract::Request,
) -> Result<impl IntoResponse, AppError> {
    let content_type = headers
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("")
        .to_ascii_lowercase();

    let ip_address = headers
        .get("x-forwarded-for")
        .and_then(|v| v.to_str().ok())
        .map(|s| s.split(',').next().unwrap_or(s).trim().to_string());
    let user_agent = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let (email, password) = if content_type.starts_with("multipart/form-data") {
        let mut multipart =
            <Multipart as axum::extract::FromRequest<AppState>>::from_request(req, &state)
                .await
                .map_err(|_| AppError::BadRequest(translate(lang, LocaleKey::AuthEmailAndPasswordRequired)))?;

        let mut email = String::new();
        let mut password = String::new();
        while let Ok(Some(field)) = multipart.next_field().await {
            let name = field.name().unwrap_or("").to_string();
            if name == "email" {
                email = field.text().await.unwrap_or_default();
            } else if name == "password" {
                password = field.text().await.unwrap_or_default();
            }
        }
        (email, password)
    } else {
        let bytes = <Bytes as axum::extract::FromRequest<AppState>>::from_request(req, &state)
            .await
            .map_err(|_| AppError::BadRequest(translate(lang, LocaleKey::AuthEmailAndPasswordRequired)))?;
        let parsed: JsonLoginBody = serde_json::from_slice(&bytes)
            .map_err(|_| AppError::BadRequest(translate(lang, LocaleKey::AuthEmailAndPasswordRequired)))?;
        (
            parsed.email.unwrap_or_default(),
            parsed.password.unwrap_or_default(),
        )
    };

    let (session, user) =
        sign_in_email::execute(&state, lang, &email, &password, ip_address, user_agent).await?;

    let cookie = build_session_cookie(&state.config, &session.token);
    let updated_jar = jar.add(cookie);

    Ok((
        StatusCode::OK,
        updated_jar,
        Json(SignInResponse {
            success: true,
            message: default_login_success_msg(lang),
            token: session.token,
            user,
        }),
    ))
}

fn default_login_success_msg(lang: Lang) -> String {
    match lang {
        Lang::Id => "Berhasil masuk".to_string(),
        Lang::En => "Signed in successfully".to_string(),
    }
}
