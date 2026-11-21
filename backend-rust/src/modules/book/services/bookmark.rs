use crate::app::AppState;
use crate::db::entities::{book_event_stats, book_interactions, books};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::book::types::BookmarkData;
use sea_orm::{ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, QueryFilter, Statement};
use uuid::Uuid;

pub async fn bookmark_book(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    book_id: i32,
    bookmarked: bool,
) -> Result<BookmarkData, AppError> {
    let book = books::Entity::find()
        .filter(books::Column::BookId.eq(book_id))
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::BookDetailNotFound)))?;

    let existing = book_interactions::Entity::find()
        .filter(book_interactions::Column::UserId.eq(user_id))
        .filter(book_interactions::Column::BookId.eq(book.id))
        .one(&state.db)
        .await?;

    let currently_bookmarked = existing.and_then(|e| e.bookmarked).unwrap_or(false);
    if currently_bookmarked == bookmarked {
        let stats = book_event_stats::Entity::find()
            .filter(book_event_stats::Column::BookId.eq(book.id))
            .one(&state.db)
            .await?;
        return Ok(BookmarkData {
            bookmarked: currently_bookmarked,
            bookmark_count: stats.map(|s| s.bookmark_count).unwrap_or(0),
        });
    }

    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO book_interactions (id, user_id, book_id, bookmarked, liked, disliked, rating, view_count, download_count, created_at, updated_at)
            VALUES ($1, $2, $3, $4, false, false, 0.00, 0, 0, NOW(), NOW())
            ON CONFLICT (user_id, book_id) DO UPDATE
            SET bookmarked = $4, updated_at = NOW()
            "#,
            vec![
                Uuid::new_v4().into(),
                user_id.into(),
                book.id.into(),
                bookmarked.into(),
            ],
        ))
        .await?;

    let inc: i32 = if bookmarked { 1 } else { -1 };
    let initial: i32 = if bookmarked { 1 } else { 0 };
    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO book_event_stats (id, book_id, bookmark_count, created_at, updated_at)
            VALUES ($1, $2, $3, NOW(), NOW())
            ON CONFLICT (book_id) DO UPDATE
            SET bookmark_count = book_event_stats.bookmark_count + $4, updated_at = NOW()
            "#,
            vec![
                Uuid::new_v4().into(),
                book.id.into(),
                initial.into(),
                inc.into(),
            ],
        ))
        .await?;

    let final_stats = book_event_stats::Entity::find()
        .filter(book_event_stats::Column::BookId.eq(book.id))
        .one(&state.db)
        .await?;

    Ok(BookmarkData {
        bookmarked,
        bookmark_count: final_stats.map(|s| s.bookmark_count).unwrap_or(0),
    })
}
