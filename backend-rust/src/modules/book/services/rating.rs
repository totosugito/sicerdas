use crate::app::AppState;
use crate::db::entities::{book_event_stats, book_interactions, books};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::book::types::{RatingData, RatingUserInteraction};
use rust_decimal::prelude::ToPrimitive;
use sea_orm::{ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, QueryFilter, Statement};
use uuid::Uuid;

pub async fn rate_book(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    book_id: i32,
    rating: f64,
) -> Result<RatingData, AppError> {
    if !(1.0..=5.0).contains(&rating) {
        return Err(AppError::BadRequest("Rating must be between 1 and 5".to_string()));
    }

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

    let old_rating = existing
        .and_then(|e| e.rating)
        .and_then(|d| d.to_f64())
        .unwrap_or(0.0);

    if (old_rating - rating).abs() < f64::EPSILON {
        let current = book_event_stats::Entity::find()
            .filter(book_event_stats::Column::BookId.eq(book.id))
            .one(&state.db)
            .await?;
        let avg = current
            .as_ref()
            .and_then(|s| s.rating.to_f64())
            .unwrap_or(0.0);
        let cnt = current.map(|s| s.rating_count).unwrap_or(0);
        return Ok(RatingData {
            rating: avg,
            rating_count: cnt,
            user_interaction: RatingUserInteraction { rating: old_rating },
        });
    }

    let rating_str = format!("{:.2}", rating);
    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO book_interactions (id, user_id, book_id, rating, liked, disliked, bookmarked, view_count, download_count, created_at, updated_at)
            VALUES ($1, $2, $3, $4::numeric, false, false, false, 0, 0, NOW(), NOW())
            ON CONFLICT (user_id, book_id) DO UPDATE
            SET rating = $4::numeric, updated_at = NOW()
            "#,
            vec![
                Uuid::new_v4().into(),
                user_id.into(),
                book.id.into(),
                rating_str.clone().into(),
            ],
        ))
        .await?;

    let is_first_time = old_rating == 0.0;
    let rating_diff = rating - old_rating;
    let count_inc: i32 = if is_first_time { 1 } else { 0 };

    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            INSERT INTO book_event_stats (id, book_id, rating_sum, rating_count, rating, created_at, updated_at)
            VALUES ($1, $2, $3::numeric, 1, $3::numeric, NOW(), NOW())
            ON CONFLICT (book_id) DO UPDATE
            SET rating_sum = book_event_stats.rating_sum + $4::numeric,
                rating_count = book_event_stats.rating_count + $5,
                updated_at = NOW()
            "#,
            vec![
                Uuid::new_v4().into(),
                book.id.into(),
                rating_str.into(),
                rating_diff.into(),
                count_inc.into(),
            ],
        ))
        .await?;

    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            UPDATE book_event_stats
            SET rating = CASE WHEN rating_count > 0 THEN rating_sum / rating_count ELSE 0 END
            WHERE book_id = $1
            "#,
            vec![book.id.into()],
        ))
        .await?;

    let final_stats = book_event_stats::Entity::find()
        .filter(book_event_stats::Column::BookId.eq(book.id))
        .one(&state.db)
        .await?;

    Ok(RatingData {
        rating: final_stats
            .as_ref()
            .and_then(|s| s.rating.to_f64())
            .unwrap_or(0.0),
        rating_count: final_stats.map(|s| s.rating_count).unwrap_or(0),
        user_interaction: RatingUserInteraction { rating },
    })
}
