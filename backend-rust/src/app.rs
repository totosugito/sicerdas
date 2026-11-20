use crate::config::AppConfig;
use crate::locales::locale_middleware;
use crate::platform::storage::StorageClient;
use crate::routes::api_router;
use axum::{
    extract::{DefaultBodyLimit, Request},
    http::{header, HeaderValue, Method, StatusCode},
    middleware::{self, Next},
    response::{IntoResponse, Response},
    Json, Router,
};
use moka::future::Cache;
use sea_orm::DatabaseConnection;
use serde::Serialize;
use std::path::Path;
use std::time::{Duration, Instant};
use tower_http::{
    compression::CompressionLayer,
    cors::{AllowOrigin, CorsLayer},
    services::ServeDir,
    set_header::SetResponseHeaderLayer,
    trace::TraceLayer,
};

#[derive(Clone)]
pub struct AppState {
    pub db: DatabaseConnection,
    pub config: AppConfig,
    pub http: reqwest::Client,
    pub storage: StorageClient,
    pub session_cache: Cache<String, serde_json::Value>,
    pub oauth_state_cache: Cache<String, String>,
    pub read_cache: Cache<String, serde_json::Value>,
    pub started_at: Instant,
}

impl AppState {
    pub fn new(db: DatabaseConnection, config: AppConfig) -> Self {
        let storage = StorageClient::from_config(&config);
        let session_cache = Cache::builder()
            .max_capacity(10_000)
            .time_to_live(Duration::from_secs(60))
            .build();
        let oauth_state_cache = Cache::builder()
            .max_capacity(10_000)
            .time_to_live(Duration::from_secs(600))
            .build();
        let read_cache = Cache::builder()
            .max_capacity(1_000)
            .time_to_live(Duration::from_secs(300))
            .build();

        Self {
            db,
            config,
            http: reqwest::Client::new(),
            storage,
            session_cache,
            oauth_state_cache,
            read_cache,
            started_at: Instant::now(),
        }
    }
}

pub fn build_app(state: AppState) -> Router {
    let trusted = state.config.trusted_origins.clone();
    let cors = CorsLayer::new()
        .allow_origin(AllowOrigin::predicate(move |origin, _| {
            let s = origin.to_str().unwrap_or("");
            trusted.iter().any(|allowed| allowed == s)
                || s.starts_with("http://localhost:")
                || s.starts_with("http://127.0.0.1:")
        }))
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::PATCH,
        ])
        .allow_headers([
            header::CONTENT_TYPE,
            header::AUTHORIZATION,
            header::USER_AGENT,
        ])
        .allow_credentials(true);

    let upload_path = Path::new(&state.config.upload_dir);
    if !upload_path.exists() {
        let _ = std::fs::create_dir_all(upload_path);
    }
    let uploads_service = ServeDir::new(&state.config.upload_dir);

    let uploads_router = Router::new()
        .fallback_service(uploads_service)
        .layer(SetResponseHeaderLayer::overriding(
            header::HeaderName::from_static("cross-origin-resource-policy"),
            HeaderValue::from_static("cross-origin"),
        ));

    let slow_threshold_ms = state.config.log_slow_threshold_ms;

    Router::new()
        .nest("/api", api_router())
        .nest("/uploads", uploads_router)
        .fallback(not_found_handler)
        .layer(middleware::from_fn(locale_middleware))
        .layer(middleware::from_fn(move |req: Request, next: Next| {
            slow_request_logger(req, next, slow_threshold_ms)
        }))
        .layer(DefaultBodyLimit::max(11 * 1024 * 1024))
        .layer(CompressionLayer::new().gzip(true))
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .with_state(state)
}

#[derive(Serialize)]
struct NotFoundBody {
    message: &'static str,
}

async fn not_found_handler() -> impl IntoResponse {
    (
        StatusCode::NOT_FOUND,
        Json(NotFoundBody {
            message: "Not Found",
        }),
    )
}

async fn slow_request_logger(req: Request, next: Next, threshold_ms: u64) -> Response {
    let method = req.method().clone();
    let uri = req.uri().to_string();
    let start = Instant::now();
    let res = next.run(req).await;
    let elapsed_ms = start.elapsed().as_millis() as u64;
    if elapsed_ms > threshold_ms {
        tracing::warn!(
            response_time_ms = elapsed_ms,
            method = %method,
            url = %uri,
            "Slow request detected"
        );
    }
    res
}
