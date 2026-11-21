use crate::app::AppState;
use crate::db::entities::app_event_history::{self, EventStatus};
use crate::db::entities::app_version::ContentType;
use crate::db::entities::{book_event_stats, books};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::book::types::{DownloadBody, DownloadData};
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, QueryFilter,
    QueryOrder, QuerySelect, Set, Statement,
};
use uuid::Uuid;

pub async fn update_download(
    state: &AppState,
    lang: Lang,
    body: DownloadBody,
    user_id: Option<Uuid>,
    session_id: Option<Uuid>,
    ip: Option<&str>,
    user_agent: Option<&str>,
) -> Result<DownloadData, AppError> {
    let reference_id = match body.id {
        Some(id) => Some(id),
        None => match body.book_id {
            Some(bid) => books::Entity::find()
                .filter(books::Column::BookId.eq(bid))
                .one(&state.db)
                .await?
                .map(|b| b.id),
            None => None,
        },
    }
    .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::BookDetailNotFound)))?;

    let mut event_query = app_event_history::Entity::find()
        .filter(app_event_history::Column::ReferenceId.eq(reference_id))
        .filter(app_event_history::Column::Action.eq(EventStatus::Download));

    if let Some(uid) = user_id {
        event_query = event_query.filter(app_event_history::Column::UserId.eq(uid));
    } else if let Some(sid) = session_id {
        event_query = event_query.filter(app_event_history::Column::SessionId.eq(sid));
    } else if let Some(ip_str) = ip {
        event_query = event_query.filter(app_event_history::Column::IpAddress.eq(ip_str));
    } else {
        event_query = event_query.filter(app_event_history::Column::IpAddress.is_null());
    }

    let last_event = event_query
        .order_by_desc(app_event_history::Column::CreatedAt)
        .limit(1)
        .one(&state.db)
        .await?;

    let now = Utc::now();
    let window_ms = state.config.content_counter_window_ms as i64;
    let should_track = match last_event {
        None => true,
        Some(ev) => (now.timestamp_millis() - ev.created_at.timestamp_millis()) > window_ms,
    };

    if should_track {
        let new_event = app_event_history::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(user_id),
            action: Set(EventStatus::Download),
            content_type: Set(ContentType::Book),
            reference_id: Set(reference_id),
            session_id: Set(if user_id.is_some() { None } else { session_id }),
            ip_address: Set(ip.map(|s| s.to_string())),
            user_agent: Set(user_agent.map(|s| s.to_string())),
            created_at: Set(now.into()),
        };
        new_event.insert(&state.db).await?;

        state
            .db
            .execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                r#"
                INSERT INTO book_event_stats (id, book_id, download_count, created_at, updated_at)
                VALUES ($1, $2, 1, NOW(), NOW())
                ON CONFLICT (book_id) DO UPDATE
                SET download_count = book_event_stats.download_count + 1, updated_at = NOW()
                "#,
                vec![Uuid::new_v4().into(), reference_id.into()],
            ))
            .await?;

        if let Some(uid) = user_id {
            state
                .db
                .execute(Statement::from_sql_and_values(
                    DbBackend::Postgres,
                    r#"
                    INSERT INTO book_interactions (id, user_id, book_id, download_count, liked, disliked, bookmarked, rating, view_count, created_at, updated_at)
                    VALUES ($1, $2, $3, 1, false, false, false, 0.00, 0, NOW(), NOW())
                    ON CONFLICT (user_id, book_id) DO UPDATE
                    SET download_count = COALESCE(book_interactions.download_count, 0) + 1, updated_at = NOW()
                    "#,
                    vec![Uuid::new_v4().into(), uid.into(), reference_id.into()],
                ))
                .await?;
        }
    }

    let stats = book_event_stats::Entity::find()
        .filter(book_event_stats::Column::BookId.eq(reference_id))
        .one(&state.db)
        .await?;

    Ok(DownloadData {
        download_count: stats.map(|s| s.download_count).unwrap_or(0),
    })
}
