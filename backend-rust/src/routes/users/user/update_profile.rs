use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::AuthSession;
use crate::modules::users::services::update_profile::{update_profile, UpdateProfileParams};
use crate::modules::users::types::UploadedFile;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Multipart, State},
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    auth: AuthSession,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, AppError> {
    let mut params = UpdateProfileParams {
        user_id: auth.user.id,
        ..Default::default()
    };

    while let Some(field) = multipart
        .next_field()
        .await
        .map_err(|e| AppError::BadRequest(e.to_string()))?
    {
        let name = field.name().unwrap_or_default().to_string();
        if name == "image" {
            let content_type = field
                .content_type()
                .unwrap_or("application/octet-stream")
                .to_string();
            let bytes = field
                .bytes()
                .await
                .map_err(|e| AppError::BadRequest(e.to_string()))?
                .to_vec();
            if !bytes.is_empty() {
                params.file = Some(UploadedFile {
                    bytes,
                    content_type,
                });
            }
            continue;
        }

        let val = field
            .text()
            .await
            .map_err(|e| AppError::BadRequest(e.to_string()))?;

        match name.as_str() {
            "name" => params.name = Some(val),
            "school" => params.school = Some(val),
            "educationLevel" => params.education_level = Some(val),
            "grade" => params.grade = Some(val),
            "phone" => params.phone = Some(val),
            "address" => params.address = Some(val),
            "bio" => params.bio = Some(val),
            "dateOfBirth" => params.date_of_birth = Some(val),
            "extra" => params.extra = Some(val),
            _ => {}
        }
    }

    let data = update_profile(&state, &auth.session.token, params, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::UserUserUpdatedSuccessfully),
        data,
    ))
}
