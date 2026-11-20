use crate::app::AppState;
use axum::{extract::State, http::StatusCode, response::IntoResponse, Json};
use chrono::Utc;
use sea_orm::{ConnectionTrait, Statement};
use serde::Serialize;

#[derive(Serialize)]
struct ReadinessChecks {
    database: &'static str,
}

#[derive(Serialize)]
struct ReadinessResponse {
    status: &'static str,
    timestamp: String,
    checks: ReadinessChecks,
    #[serde(skip_serializing_if = "Option::is_none")]
    error: Option<String>,
}

pub async fn handler(State(state): State<AppState>) -> impl IntoResponse {
    let stmt = Statement::from_string(sea_orm::DatabaseBackend::Postgres, "SELECT 1".to_string());
    match state.db.execute(stmt).await {
        Ok(_) => (
            StatusCode::OK,
            Json(ReadinessResponse {
                status: "ready",
                timestamp: Utc::now().to_rfc3339(),
                checks: ReadinessChecks {
                    database: "connected",
                },
                error: None,
            }),
        ),
        Err(err) => (
            StatusCode::SERVICE_UNAVAILABLE,
            Json(ReadinessResponse {
                status: "not_ready",
                timestamp: Utc::now().to_rfc3339(),
                checks: ReadinessChecks {
                    database: "disconnected",
                },
                error: Some(err.to_string()),
            }),
        ),
    }
}
