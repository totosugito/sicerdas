mod app;
mod config;
mod db;
mod error;
mod locales;
mod middleware;
mod modules;
mod platform;
mod routes;
mod types;

use crate::app::{build_app, AppState};
use crate::config::AppConfig;
use std::net::SocketAddr;
use tokio::net::TcpListener;
use tracing_subscriber::{fmt, layer::SubscriberExt, util::SubscriberInitExt, EnvFilter};

#[tokio::main]
async fn main() {
    let config = AppConfig::from_env();

    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(config.log_level.clone()));

    let _guard = if config.log_save_to_file {
        let file_appender = tracing_appender::rolling::daily(&config.log_dir, "api-issues.log");
        let (non_blocking, guard) = tracing_appender::non_blocking(file_appender);
        tracing_subscriber::registry()
            .with(env_filter)
            .with(fmt::layer())
            .with(fmt::layer().with_writer(non_blocking).with_ansi(false))
            .init();
        Some(guard)
    } else {
        tracing_subscriber::registry()
            .with(env_filter)
            .with(fmt::layer())
            .init();
        None
    };

    let db = db::connect_db(&config)
        .await
        .expect("Failed to connect to PostgreSQL");

    let addr: SocketAddr = format!("{}:{}", config.host, config.port)
        .parse()
        .expect("Invalid HOST:PORT");

    let state = AppState::new(db, config);
    let app = build_app(state);

    tracing::info!("SiCerdas backend-rust listening on http://{addr}");
    let listener = TcpListener::bind(addr)
        .await
        .expect("Failed to bind TCP listener");

    axum::serve(listener, app)
        .with_graceful_shutdown(shutdown_signal())
        .await
        .expect("Server error");
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("Failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("Failed to install SIGTERM handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
    tracing::info!("Shutdown signal received, draining connections...");
}
