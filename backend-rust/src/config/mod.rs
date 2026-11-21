use std::env;
use std::path::Path;

#[derive(Debug, Clone)]
pub struct AppConfig {
    pub env_mode: String,
    pub host: String,
    pub port: u16,
    pub frontend_url: String,
    pub api_url: String,
    pub cookie_prefix: String,
    pub better_auth_secret: String,
    pub trusted_origins: Vec<String>,
    pub database_url: String,
    pub google_web_client_id: Option<String>,
    pub google_ios_client_id: Option<String>,
    pub google_android_client_id: Option<String>,
    pub google_client_secret: Option<String>,
    pub resend_api_key: Option<String>,
    pub no_reply_email: String,
    pub no_reply_email_name: String,
    pub upload_dir: String,
    pub use_s3_storage: bool,
    pub s3_bucket_name: Option<String>,
    pub s3_access_key_id: Option<String>,
    pub s3_secret_access_key: Option<String>,
    pub s3_endpoint: Option<String>,
    pub s3_public_url: Option<String>,
    pub s3_region: Option<String>,
    pub log_level: String,
    pub log_dir: String,
    pub log_save_to_file: bool,
    pub log_slow_threshold_ms: u64,
    pub password_reset_rate_limit: u32,
    pub password_reset_rate_limit_window_ms: u64,
    pub content_counter_window_ms: u64,
}

impl AppConfig {
    pub fn from_env() -> Self {
        let env_mode = env::var("NODE_ENV").unwrap_or_else(|_| "development".to_string());
        let env_file = if env_mode == "development" {
            ".env.devel"
        } else {
            ".env"
        };

        if Path::new(env_file).exists() {
            if let Err(e) = dotenvy::from_filename_override(env_file) {
                eprintln!("Warning: failed to parse {env_file}: {e}");
            }
        } else {
            let fallback = format!("../backend/{env_file}");
            if Path::new(&fallback).exists() {
                if let Err(e) = dotenvy::from_filename_override(&fallback) {
                    eprintln!("Warning: failed to parse {fallback}: {e}");
                }
            } else if Path::new("../backend/.env").exists() {
                if let Err(e) = dotenvy::from_filename_override("../backend/.env") {
                    eprintln!("Warning: failed to parse ../backend/.env: {e}");
                }
            }
        }

        let host = env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
        let port = env::var("PORT")
            .ok()
            .and_then(|v| v.parse::<u16>().ok())
            .unwrap_or(5560);
        let protocol = env::var("PROTOCOL").unwrap_or_else(|_| "http".to_string());
        let frontend_url =
            env::var("FRONTEND_URL").unwrap_or_else(|_| "http://127.0.0.1:5551".to_string());

        let api_host = if host == "0.0.0.0" {
            "127.0.0.1"
        } else {
            &host
        };
        let api_url = env::var("BETTER_AUTH_URL")
            .ok()
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| format!("{protocol}://{api_host}:{port}"));

        let database_url = env::var("DATABASE_URL")
            .ok()
            .filter(|s| !s.is_empty())
            .unwrap_or_else(|| {
                let pg_host = env::var("POSTGRES_HOST").unwrap_or_else(|_| "localhost".into());
                let pg_port = env::var("POSTGRES_PORT").unwrap_or_else(|_| "5432".into());
                let pg_user = env::var("POSTGRES_USER").unwrap_or_else(|_| "postgres".into());
                let pg_pass = env::var("POSTGRES_PASSWORD").unwrap_or_default();
                let pg_db = env::var("POSTGRES_DB").unwrap_or_else(|_| "sicerdas".into());
                format!("postgresql://{pg_user}:{pg_pass}@{pg_host}:{pg_port}/{pg_db}")
            });

        let mut trusted_origins = vec![
            frontend_url.clone(),
            format!("{protocol}://{host}:{port}"),
            "http://127.0.0.1:5551".to_string(),
            "http://localhost:5551".to_string(),
            "http://127.0.0.1:5552".to_string(),
            "http://localhost:5552".to_string(),
            "http://10.0.2.2:5550".to_string(),
            "http://127.0.0.1:1552".to_string(),
            "tauri://localhost".to_string(),
            "http://tauri.localhost".to_string(),
        ];
        if !frontend_url.starts_with("http://") && !frontend_url.starts_with("https://") {
            trusted_origins.push(format!("{protocol}://{frontend_url}"));
        }

        Self {
            env_mode,
            host,
            port,
            frontend_url,
            api_url,
            cookie_prefix: env::var("COOKIE_PREFIX").unwrap_or_else(|_| "cookie".to_string()),
            better_auth_secret: env::var("BETTER_AUTH_SECRET")
                .unwrap_or_else(|_| "secret".to_string()),
            trusted_origins,
            database_url,
            google_web_client_id: opt_env("GOOGLE_WEB_CLIENT_ID"),
            google_ios_client_id: opt_env("GOOGLE_IOS_CLIENT_ID"),
            google_android_client_id: opt_env("GOOGLE_ANDROID_CLIENT_ID"),
            google_client_secret: opt_env("GOOGLE_CLIENT_SECRET"),
            resend_api_key: opt_env("RESEND_API_KEY"),
            no_reply_email: env::var("NO_REPLY_EMAIL")
                .unwrap_or_else(|_| "no-reply@sicerdas.com".to_string()),
            no_reply_email_name: env::var("NO_REPLY_EMAIL_NAME")
                .unwrap_or_else(|_| "SiCerdas No-Reply".to_string()),
            upload_dir: resolve_relative_dir(
                &env::var("UPLOAD_DIR").unwrap_or_else(|_| "uploads".to_string()),
            ),
            use_s3_storage: env::var("USE_S3_STORAGE")
                .map(|v| v == "true" || v == "1")
                .unwrap_or(false),
            s3_bucket_name: opt_env("S3_BUCKET_NAME"),
            s3_access_key_id: opt_env("S3_ACCESS_KEY_ID"),
            s3_secret_access_key: opt_env("S3_SECRET_ACCESS_KEY"),
            s3_endpoint: opt_env("S3_ENDPOINT"),
            s3_public_url: opt_env("S3_PUBLIC_URL"),
            s3_region: opt_env("S3_REGION"),
            log_level: env::var("LOG_LEVEL").unwrap_or_else(|_| "info".to_string()),
            log_dir: resolve_relative_dir(
                &env::var("LOG_DIR").unwrap_or_else(|_| "logs".to_string()),
            ),
            log_save_to_file: env::var("LOG_SAVE_TO_FILE")
                .map(|v| v == "true" || v == "1")
                .unwrap_or(false),
            log_slow_threshold_ms: env::var("LOG_SLOW_RESPONSE_THRESHOLD")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(500),
            password_reset_rate_limit: env::var("PASSWORD_RESET_RATE_LIMIT")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(3),
            password_reset_rate_limit_window_ms: env::var("PASSWORD_RESET_RATE_LIMIT_WINDOW_MS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(60 * 60 * 1000),
            content_counter_window_ms: env::var("CONTENT_COUNTER_WINDOW_MS")
                .ok()
                .and_then(|v| v.parse().ok())
                .unwrap_or(24 * 60 * 60 * 1000),
        }
    }
}

fn opt_env(key: &str) -> Option<String> {
    env::var(key).ok().filter(|s| !s.trim().is_empty())
}

fn resolve_relative_dir(raw: &str) -> String {
    let trimmed = raw.trim_matches('/');
    if trimmed.is_empty() {
        ".".to_string()
    } else if raw.starts_with("../") || raw.starts_with("./") {
        raw.to_string()
    } else {
        format!("../{trimmed}")
    }
}
