use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use axum::{
    body::Body,
    extract::{Path, Query, State},
    http::{header, HeaderMap, HeaderValue, StatusCode},
    response::{IntoResponse, Response},
};
use serde::Deserialize;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ProxyPdfQuery {
    pub url: String,
    pub file: Option<String>,
    #[allow(dead_code)]
    pub id: Option<Uuid>,
    #[allow(dead_code)]
    pub book_id: Option<i32>,
}

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    headers: HeaderMap,
    Query(query): Query<ProxyPdfQuery>,
) -> Result<Response, AppError> {
    proxy_impl(&state, &locale, &headers, query, None).await
}

pub async fn handler_with_filename(
    State(state): State<AppState>,
    locale: RequestLocale,
    headers: HeaderMap,
    Path(filename): Path<String>,
    Query(query): Query<ProxyPdfQuery>,
) -> Result<Response, AppError> {
    proxy_impl(&state, &locale, &headers, query, Some(filename)).await
}

async fn proxy_impl(
    state: &AppState,
    locale: &RequestLocale,
    headers: &HeaderMap,
    query: ProxyPdfQuery,
    filename: Option<String>,
) -> Result<Response, AppError> {
    let ua = headers
        .get(header::USER_AGENT)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

    let mut req_builder = state.http.get(&query.url).header(header::USER_AGENT, ua);
    if let Some(range) = headers.get(header::RANGE).and_then(|v| v.to_str().ok()) {
        req_builder = req_builder.header(header::RANGE, range);
    }

    let resp = req_builder.send().await.map_err(|e| {
        AppError::Internal(
            locale
                .t(LocaleKey::BookProxyPdfError)
                .replace("{{message}}", &e.to_string()),
        )
    })?;

    let status = resp.status();
    if status.as_u16() >= 400 {
        let msg = locale
            .t(LocaleKey::BookProxyPdfError)
            .replace("{{message}}", &format!("S3 returned {}", status.as_u16()));
        return match status.as_u16() {
            403 => Err(AppError::Forbidden(msg)),
            404 => Err(AppError::NotFound(msg)),
            _ => Err(AppError::Internal(msg)),
        };
    }

    let content_type = resp
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/pdf")
        .to_string();
    let content_length = resp
        .headers()
        .get(header::CONTENT_LENGTH)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let content_range = resp
        .headers()
        .get(header::CONTENT_RANGE)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());
    let accept_ranges = resp
        .headers()
        .get(header::ACCEPT_RANGES)
        .and_then(|v| v.to_str().ok())
        .map(|s| s.to_string());

    let file_name = filename
        .or(query.file)
        .unwrap_or_else(|| "document.pdf".to_string());

    let axum_status =
        StatusCode::from_u16(status.as_u16()).unwrap_or(StatusCode::OK);
    let mut builder = Response::builder()
        .status(axum_status)
        .header(header::CONTENT_TYPE, content_type)
        .header(
            header::CONTENT_DISPOSITION,
            format!("inline; filename=\"{file_name}\""),
        )
        .header(header::ACCESS_CONTROL_ALLOW_ORIGIN, "*");

    if let Some(cl) = content_length {
        if let Ok(hv) = HeaderValue::from_str(&cl) {
            builder = builder.header(header::CONTENT_LENGTH, hv);
        }
    }
    if let Some(cr) = content_range {
        if let Ok(hv) = HeaderValue::from_str(&cr) {
            builder = builder.header(header::CONTENT_RANGE, hv);
        }
    }
    if let Some(ar) = accept_ranges {
        if let Ok(hv) = HeaderValue::from_str(&ar) {
            builder = builder.header(header::ACCEPT_RANGES, hv);
        }
    }

    let stream = resp.bytes_stream();
    let response = builder
        .body(Body::from_stream(stream))
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(response.into_response())
}
