use axum::{
    http::StatusCode,
    response::{IntoResponse, Response},
    Json,
};
use serde::Serialize;

#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    Forbidden(String),
    NotFound(String),
    Conflict(String),
    Unprocessable(String),
    TooManyRequests(String),
    Internal(String),
}

#[derive(Serialize)]
struct ErrorBody {
    success: bool,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            AppError::BadRequest(m) => (StatusCode::BAD_REQUEST, m),
            AppError::Unauthorized(m) => (StatusCode::UNAUTHORIZED, m),
            AppError::Forbidden(m) => (StatusCode::FORBIDDEN, m),
            AppError::NotFound(m) => (StatusCode::NOT_FOUND, m),
            AppError::Conflict(m) => (StatusCode::CONFLICT, m),
            AppError::Unprocessable(m) => (StatusCode::UNPROCESSABLE_ENTITY, m),
            AppError::TooManyRequests(m) => (StatusCode::TOO_MANY_REQUESTS, m),
            AppError::Internal(m) => {
                tracing::error!(error = %m, "Internal server error");
                (StatusCode::INTERNAL_SERVER_ERROR, m)
            }
        };

        (
            status,
            Json(ErrorBody {
                success: false,
                message,
            }),
        )
            .into_response()
    }
}

impl From<sea_orm::DbErr> for AppError {
    fn from(err: sea_orm::DbErr) -> Self {
        AppError::Internal(err.to_string())
    }
}
