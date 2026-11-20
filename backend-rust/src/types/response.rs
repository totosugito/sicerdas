use axum::{http::StatusCode, response::IntoResponse, Json};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub struct ApiResponse<T: Serialize> {
    pub success: bool,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
}

impl<T: Serialize> ApiResponse<T> {
    pub fn ok(message: impl Into<String>, data: T) -> impl IntoResponse {
        (
            StatusCode::OK,
            Json(Self {
                success: true,
                message: message.into(),
                data: Some(data),
            }),
        )
    }

    pub fn created(message: impl Into<String>, data: T) -> impl IntoResponse {
        (
            StatusCode::CREATED,
            Json(Self {
                success: true,
                message: message.into(),
                data: Some(data),
            }),
        )
    }
}

impl ApiResponse<()> {
    pub fn msg(message: impl Into<String>) -> impl IntoResponse {
        (
            StatusCode::OK,
            Json(Self {
                success: true,
                message: message.into(),
                data: None,
            }),
        )
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginationMeta {
    pub total: u64,
    pub page: u64,
    pub limit: u64,
    pub total_pages: u64,
}
