use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use axum::body::Body;
use axum::http::{header, HeaderMap, StatusCode};
use axum::response::Response;

pub async fn proxy_periodic_zip(
    state: &AppState,
    locale: RequestLocale,
) -> Result<Response, AppError> {
    let base = state.config.s3_public_url.as_deref().unwrap_or("");
    let url = format!("{}/table-periodic/periodic-table.zip", base.trim_end_matches('/'));

    let resp = state.http.get(&url).send().await.map_err(|e| {
        tracing::error!(err = %e, url = %url, "Failed to proxy periodic table zip");
        AppError::Internal(locale.t(LocaleKey::PeriodicDownloadFailed))
    })?;

    if !resp.status().is_success() {
        return Err(AppError::Internal(
            locale.t(LocaleKey::PeriodicDownloadFailed),
        ));
    }

    let mut headers = HeaderMap::new();
    let ct = resp
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("application/zip");
    if let Ok(val) = ct.parse() {
        headers.insert(header::CONTENT_TYPE, val);
    }
    if let Some(cl) = resp.headers().get(header::CONTENT_LENGTH) {
        headers.insert(header::CONTENT_LENGTH, cl.clone());
    }
    let cd = resp
        .headers()
        .get(header::CONTENT_DISPOSITION)
        .and_then(|v| v.to_str().ok())
        .unwrap_or("attachment; filename=\"periodic-table.zip\"");
    if let Ok(val) = cd.parse() {
        headers.insert(header::CONTENT_DISPOSITION, val);
    }

    let stream = resp.bytes_stream();
    let body = Body::from_stream(stream);
    let mut response = Response::new(body);
    *response.status_mut() = StatusCode::OK;
    *response.headers_mut() = headers;
    Ok(response)
}
