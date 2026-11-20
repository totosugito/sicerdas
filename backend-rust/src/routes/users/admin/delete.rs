use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::users::services::delete_user::delete_single_user;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
};
use uuid::Uuid;

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    admin: RequireAdmin,
    Path(id): Path<Uuid>,
) -> Result<impl IntoResponse, AppError> {
    delete_single_user(&state, admin.0.user.id, id, locale).await?;
    Ok(ApiResponse::msg(
        locale.t(LocaleKey::UserDeleteSuccess),
    ))
}
