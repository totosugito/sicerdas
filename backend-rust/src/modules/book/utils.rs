use crate::app::AppState;
use crate::db::entities::app_version::{self, ContentStatus, ContentType};
use crate::error::AppError;
use crate::modules::book::types::BookCover;
use md5::{Digest, Md5};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder, QuerySelect};

const CACHE_KEY_LATEST_BOOK_VERSION: &str = "latest_version:book";

pub fn get_book_cover_url(s3_public_url: Option<&str>, book_id: i32) -> BookCover {
    let base = s3_public_url.unwrap_or("").trim_end_matches('/');
    let dir_name = book_id.div_euclid(1000);
    let file_id = format!("{:04}", book_id);
    BookCover {
        xs: format!("{base}/book/images/{dir_name}/xs/{file_id}/{file_id}_0000_xs.jpg"),
        lg: format!("{base}/book/images/{dir_name}/lg/{file_id}/{file_id}_0000_lg.jpg"),
    }
}

pub fn get_book_sample_pages_url(s3_public_url: Option<&str>, book_id: i32) -> BookCover {
    let base = s3_public_url.unwrap_or("").trim_end_matches('/');
    let dir_name = book_id.div_euclid(1000);
    let file_id = format!("{:04}", book_id);
    BookCover {
        xs: format!("{base}/book/images/{dir_name}/xs/{file_id}/{file_id}_"),
        lg: format!("{base}/book/images/{dir_name}/lg/{file_id}/{file_id}_"),
    }
}

pub fn create_auto_book_name(book_id: i32) -> String {
    let file_id = format!("{:04}", book_id);
    let mut hasher = Md5::new();
    hasher.update(book_id.to_string().as_bytes());
    let md5_hex = format!("{:x}", hasher.finalize());
    if md5_hex.len() > 4 {
        format!("{file_id}_{}", &md5_hex[..4])
    } else {
        String::new()
    }
}

pub fn get_book_pdf_url(s3_public_url: Option<&str>, book_id: i32) -> String {
    let base = s3_public_url.unwrap_or("").trim_end_matches('/');
    let dir_name = book_id.div_euclid(1000);
    let name = create_auto_book_name(book_id);
    format!("{base}/book/pdf/{dir_name}/{name}.pdf")
}

pub async fn get_latest_book_version_id(state: &AppState) -> Result<Option<i32>, AppError> {
    if let Some(cached) = state.read_cache.get(CACHE_KEY_LATEST_BOOK_VERSION).await {
        if let Some(id) = cached.as_i64() {
            return Ok(Some(id as i32));
        }
        if cached.is_null() {
            return Ok(None);
        }
    }

    let latest = app_version::Entity::find()
        .filter(app_version::Column::DataType.eq(ContentType::Book))
        .filter(app_version::Column::Status.eq(ContentStatus::Published))
        .order_by_desc(app_version::Column::DbVersion)
        .limit(1)
        .one(&state.db)
        .await?;

    let id = latest.map(|v| v.id);
    let cache_val = match id {
        Some(v) => serde_json::json!(v),
        None => serde_json::Value::Null,
    };
    state
        .read_cache
        .insert(CACHE_KEY_LATEST_BOOK_VERSION.to_string(), cache_val)
        .await;

    Ok(id)
}
