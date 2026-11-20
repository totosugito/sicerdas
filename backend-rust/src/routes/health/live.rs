use axum::{http::StatusCode, response::IntoResponse, Json};
use chrono::Utc;
use serde::Serialize;

#[derive(Serialize)]
struct LivenessResponse {
    status: &'static str,
    timestamp: String,
}

pub async fn handler() -> impl IntoResponse {
    (
        StatusCode::OK,
        Json(LivenessResponse {
            status: "ok",
            timestamp: Utc::now().to_rfc3339(),
        }),
    )
}
