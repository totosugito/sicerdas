use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::app::types::BookInfoData;
use md5::{Digest, Md5};
use sea_orm::{ConnectionTrait, DbBackend, Statement};

fn build_book_pdf_url(public_url: &str, book_id: i32) -> String {
    let dir_name = book_id / 1000;
    let file_id = format!("{book_id:04}");
    let mut hasher = Md5::new();
    hasher.update(book_id.to_string().as_bytes());
    let md5_hex = format!("{:x}", hasher.finalize());
    let name = if md5_hex.len() > 4 {
        format!("{file_id}_{}", &md5_hex[..4])
    } else {
        String::new()
    };
    format!(
        "{}/book/pdf/{dir_name}/{name}.pdf",
        public_url.trim_end_matches('/')
    )
}

pub async fn get_book_info(
    state: &AppState,
    book_id: i32,
    page: i32,
    locale: RequestLocale,
) -> Result<BookInfoData, AppError> {
    let row = state
        .db
        .query_one(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "SELECT id, book_id, title, description, author, published_year, total_pages, size, status::text AS status FROM books WHERE book_id = $1 AND total_pages = $2 LIMIT 1",
            [book_id.into(), page.into()],
        ))
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::BookDetailNotFound)))?;

    let b_id: i32 = row.try_get("", "book_id")?;
    let public_url = state.config.s3_public_url.as_deref().unwrap_or("");

    Ok(BookInfoData {
        id: row.try_get("", "id")?,
        book_id: b_id,
        title: row.try_get("", "title")?,
        description: row.try_get("", "description")?,
        author: row.try_get("", "author")?,
        published_year: row.try_get("", "published_year")?,
        total_pages: row.try_get("", "total_pages")?,
        size: row.try_get("", "size")?,
        status: row.try_get("", "status")?,
        pdf: build_book_pdf_url(public_url, b_id),
    })
}
