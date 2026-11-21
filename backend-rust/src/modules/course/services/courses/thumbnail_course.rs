use crate::app::AppState;
use crate::db::entities::courses;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::ThumbnailResponseData;
use crate::modules::course::utils::{build_course_thumbnail_rel_path, get_course_thumbnail_url};
use chrono::Utc;
use image::ImageFormat;
use sea_orm::{ActiveModelTrait, EntityTrait, Set};
use std::io::Cursor;
use uuid::Uuid;

const MAX_THUMBNAIL_BYTES: usize = 5 * 1024 * 1024;

pub async fn update_course_thumbnail(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    action: Option<&str>,
    file: Option<(Vec<u8>, String)>,
) -> Result<ThumbnailResponseData, AppError> {
    let existing = courses::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::CourseCoursesNotFound)))?;

    if action == Some("remove") {
        if let Some(ref old_path) = existing.thumbnail {
            state.storage.delete_file(old_path).await;
        }
        let mut active: courses::ActiveModel = existing.into();
        active.thumbnail = Set(None);
        active.updated_at = Set(Utc::now().naive_utc());
        let updated = active.update(&state.db).await?;
        return Ok(ThumbnailResponseData {
            id: updated.id,
            thumbnail: None,
        });
    }

    let (bytes, content_type) = file.ok_or_else(|| {
        AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::ExamPackagesThumbnailNoFileUploaded,
        ))
    })?;

    if !matches!(
        content_type.as_str(),
        "image/jpeg" | "image/png" | "image/webp"
    ) {
        return Err(AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::ExamPackagesThumbnailInvalidFileType,
        )));
    }

    if bytes.len() > MAX_THUMBNAIL_BYTES {
        return Err(AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::ExamPackagesThumbnailFileSizeTooLarge,
        )));
    }

    if let Some(ref old_path) = existing.thumbnail {
        state.storage.delete_file(old_path).await;
    }

    let img = image::load_from_memory(&bytes).map_err(|_| {
        AppError::BadRequest(locales::translate(
            lang,
            LocaleKey::ExamPackagesThumbnailInvalidFileType,
        ))
    })?;

    let resized = if img.width() > 600 {
        img.resize(600, u32::MAX, image::imageops::FilterType::Lanczos3)
    } else {
        img
    };

    let mut out_buf = Cursor::new(Vec::new());
    resized
        .to_rgb8()
        .write_to(&mut out_buf, ImageFormat::Jpeg)
        .map_err(|e| AppError::Internal(format!("Failed to encode thumbnail: {e}")))?;

    let filename = format!("crs_thumb_{}.jpg", Uuid::new_v4().simple());
    let rel_path = build_course_thumbnail_rel_path(existing.id, existing.created_at, &filename);
    state
        .storage
        .save_file(&rel_path, out_buf.into_inner(), "image/jpeg")
        .await?;

    let mut active: courses::ActiveModel = existing.into();
    active.thumbnail = Set(Some(rel_path));
    active.updated_at = Set(Utc::now().naive_utc());
    let updated = active.update(&state.db).await?;

    Ok(ThumbnailResponseData {
        id: updated.id,
        thumbnail: get_course_thumbnail_url(state, updated.thumbnail.as_deref()),
    })
}
