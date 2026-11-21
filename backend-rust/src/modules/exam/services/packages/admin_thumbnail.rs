use crate::app::AppState;
use crate::db::entities::exam::exam_packages;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::ThumbnailData;
use crate::modules::exam::utils::{build_package_thumbnail_rel_path, get_package_thumbnail_url};
use chrono::Utc;
use image::ImageFormat;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use std::io::Cursor;
use uuid::Uuid;

pub struct UploadedThumbnail {
    pub bytes: Vec<u8>,
    pub content_type: String,
}

pub async fn admin_thumbnail(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    action: Option<&str>,
    file: Option<UploadedThumbnail>,
) -> Result<ThumbnailData, AppError> {
    let existing = exam_packages::Entity::find_by_id(id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDetailNotFound)))?;

    if action == Some("remove") {
        if let Some(ref old_path) = existing.thumbnail {
            state.storage.delete_file(old_path).await;
        }
        let mut active: exam_packages::ActiveModel = existing.into();
        active.thumbnail = Set(None);
        active.updated_at = Set(Utc::now().fixed_offset());
        let updated = active
            .update(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        return Ok(ThumbnailData {
            id: updated.id,
            thumbnail: None,
        });
    }

    let file = file.ok_or_else(|| {
        AppError::BadRequest(translate(lang, LocaleKey::ExamPackagesThumbnailNoFileUploaded))
    })?;

    if !matches!(
        file.content_type.as_str(),
        "image/jpeg" | "image/png" | "image/webp"
    ) {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::ExamPackagesThumbnailInvalidFileType)));
    }

    const MAX_SIZE: usize = 5 * 1024 * 1024;
    if file.bytes.len() > MAX_SIZE {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::ExamPackagesThumbnailFileSizeTooLarge)));
    }

    let img = image::load_from_memory(&file.bytes)
        .map_err(|_| AppError::BadRequest(translate(lang, LocaleKey::ExamPackagesThumbnailInvalidFileType)))?;
    let resized = img.thumbnail(800, 800);
    let mut out_bytes = Vec::new();
    resized
        .write_to(&mut Cursor::new(&mut out_bytes), ImageFormat::WebP)
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if let Some(ref old_path) = existing.thumbnail {
        state.storage.delete_file(old_path).await;
    }

    let filename = format!("{}.webp", Uuid::new_v4());
    let rel_path = build_package_thumbnail_rel_path(
        existing.id,
        existing.created_at.with_timezone(&Utc),
        &filename,
    );

    state
        .storage
        .save_file(&rel_path, out_bytes, "image/webp")
        .await?;

    let mut active: exam_packages::ActiveModel = existing.into();
    active.thumbnail = Set(Some(rel_path.clone()));
    active.updated_at = Set(Utc::now().fixed_offset());
    let updated = active
        .update(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(ThumbnailData {
        id: updated.id,
        thumbnail: get_package_thumbnail_url(state, updated.thumbnail.as_deref()),
    })
}
