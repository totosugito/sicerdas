use crate::app::AppState;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use chrono::Utc;
use sea_orm::{ConnectionTrait, Statement};
use serde::Serialize;
use std::time::Instant;

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DatabaseCheck {
    status: &'static str,
    latency_ms: u64,
}

#[derive(Serialize)]
struct HealthChecks {
    database: DatabaseCheck,
}

#[derive(Serialize)]
struct HealthStatusResponse {
    status: &'static str,
    timestamp: String,
    uptime: f64,
    environment: String,
    checks: HealthChecks,
}

pub async fn handler(State(state): State<AppState>) -> impl IntoResponse {
    let start = Instant::now();
    let stmt = Statement::from_string(sea_orm::DatabaseBackend::Postgres, "SELECT 1".to_string());
    let (db_status, latency_ms) = match state.db.execute(stmt).await {
        Ok(_) => ("up", start.elapsed().as_millis() as u64),
        Err(_) => ("down", 0),
    };

    let is_healthy = db_status == "up";
    let status_code = if is_healthy {
        StatusCode::OK
    } else {
        StatusCode::SERVICE_UNAVAILABLE
    };

    (
        status_code,
        Json(HealthStatusResponse {
            status: if is_healthy { "ok" } else { "degraded" },
            timestamp: Utc::now().to_rfc3339(),
            uptime: state.started_at.elapsed().as_secs_f64(),
            environment: state.config.env_mode.clone(),
            checks: HealthChecks {
                database: DatabaseCheck {
                    status: db_status,
                    latency_ms,
                },
            },
        }),
    )
}
