use crate::app::AppState;
use crate::db::entities::app_event_history::{self, EventStatus};
use crate::db::entities::app_version::ContentType;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::book::types::{
    BookCategoryRef, BookDetailData, BookDetailUserInteraction, BookGradeRef, BookGroupRef,
};
use crate::modules::book::utils::{
    get_book_cover_url, get_book_pdf_url, get_book_sample_pages_url, get_latest_book_version_id,
};
use chrono::{DateTime, Utc};
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, FromQueryResult,
    QueryFilter, QueryOrder, QuerySelect, Set, Statement, Value,
};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct BookDetailRow {
    id: Uuid,
    book_id: i32,
    title: String,
    description: Option<String>,
    author: String,
    published_year: String,
    total_pages: i32,
    size: i32,
    status: String,
    rating: Option<f64>,
    view_count: Option<i32>,
    download_count: Option<i32>,
    bookmark_count: Option<i32>,
    rating_count: Option<i32>,
    is_new: bool,
    created_at: Option<DateTime<Utc>>,
    updated_at: Option<DateTime<Utc>>,
    category_id: Option<i32>,
    category_name: Option<String>,
    group_id: Option<i32>,
    group_name: Option<String>,
    group_short_name: Option<String>,
    grade_id: Option<i32>,
    grade_name: Option<String>,
    grade_val: Option<String>,
    liked: Option<bool>,
    disliked: Option<bool>,
    user_rating: Option<f64>,
    bookmarked: Option<bool>,
    user_view_count: Option<i32>,
    user_download_count: Option<i32>,
}

pub async fn detail_book(
    state: &AppState,
    lang: Lang,
    book_id: i32,
    user_id: Option<Uuid>,
    ip: Option<&str>,
    user_agent: Option<&str>,
    session_id: Option<Uuid>,
) -> Result<BookDetailData, AppError> {
    let latest_version_id = get_latest_book_version_id(state).await?;

    let mut values: Vec<Value> = vec![book_id.into()];
    let is_new_expr = match latest_version_id {
        Some(vid) => {
            values.push(vid.into());
            format!("(b.version_id = ${})", values.len())
        }
        None => "false".to_string(),
    };

    let (user_select, user_join) = if let Some(uid) = user_id {
        values.push(uid.into());
        let p = values.len();
        (
            "bi.liked, bi.disliked, bi.rating::float8 AS user_rating, bi.bookmarked, bi.view_count AS user_view_count, bi.download_count AS user_download_count",
            format!("LEFT JOIN book_interactions bi ON b.id = bi.book_id AND bi.user_id = ${p}"),
        )
    } else {
        (
            "NULL::boolean AS liked, NULL::boolean AS disliked, NULL::float8 AS user_rating, NULL::boolean AS bookmarked, NULL::integer AS user_view_count, NULL::integer AS user_download_count",
            String::new(),
        )
    };

    let sql = format!(
        r#"
        SELECT
            b.id,
            b.book_id,
            b.title,
            b.description,
            b.author,
            b.published_year,
            b.total_pages,
            b.size,
            b.status::text AS status,
            bes.rating::float8 AS rating,
            bes.view_count,
            bes.download_count,
            bes.bookmark_count,
            bes.rating_count,
            {is_new_expr} AS is_new,
            b.created_at,
            b.updated_at,
            bc.id AS category_id,
            bc.name AS category_name,
            bg.id AS group_id,
            bg.name AS group_name,
            bg.short_name AS group_short_name,
            eg.id AS grade_id,
            eg.name AS grade_name,
            eg.grade AS grade_val,
            {user_select}
        FROM books b
        LEFT JOIN book_group bg ON b.book_group_id = bg.id
        LEFT JOIN book_category bc ON bg.category_id = bc.id
        LEFT JOIN education_grades eg ON b.education_grade_id = eg.id
        LEFT JOIN book_event_stats bes ON b.id = bes.book_id
        {user_join}
        WHERE b.book_id = $1
        LIMIT 1
        "#
    );

    let book = BookDetailRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &sql,
        values,
    ))
    .one(&state.db)
    .await?
    .ok_or_else(|| AppError::NotFound(locales::translate(lang, LocaleKey::BookDetailNotFound)))?;

    // Track view event within content_counter_window_ms
    let mut event_query = app_event_history::Entity::find()
        .filter(app_event_history::Column::ReferenceId.eq(book.id))
        .filter(app_event_history::Column::Action.eq(EventStatus::View));

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
            action: Set(EventStatus::View),
            content_type: Set(ContentType::Book),
            reference_id: Set(book.id),
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
                INSERT INTO book_event_stats (id, book_id, view_count, created_at, updated_at)
                VALUES ($1, $2, 1, NOW(), NOW())
                ON CONFLICT (book_id) DO UPDATE
                SET view_count = book_event_stats.view_count + 1, updated_at = NOW()
                "#,
                vec![Uuid::new_v4().into(), book.id.into()],
            ))
            .await?;

        if let Some(uid) = user_id {
            state
                .db
                .execute(Statement::from_sql_and_values(
                    DbBackend::Postgres,
                    r#"
                    INSERT INTO book_interactions (id, user_id, book_id, view_count, liked, disliked, bookmarked, rating, download_count, created_at, updated_at)
                    VALUES ($1, $2, $3, 1, false, false, false, 0.00, 0, NOW(), NOW())
                    ON CONFLICT (user_id, book_id) DO UPDATE
                    SET view_count = COALESCE(book_interactions.view_count, 0) + 1, updated_at = NOW()
                    "#,
                    vec![Uuid::new_v4().into(), uid.into(), book.id.into()],
                ))
                .await?;
        }
    }

    let s3_public = state.config.s3_public_url.as_deref();
    let now_iso = now.to_rfc3339();
    let rating = match book.rating {
        Some(r) if r > 0.0 => r,
        _ => 5.0,
    };

    Ok(BookDetailData {
        id: book.id,
        book_id: book.book_id,
        title: book.title,
        description: book.description,
        author: Some(book.author),
        published_year: book.published_year,
        total_pages: book.total_pages,
        size: book.size,
        status: book.status,
        rating,
        view_count: book.view_count.unwrap_or(0),
        download_count: book.download_count.unwrap_or(0),
        bookmark_count: book.bookmark_count.unwrap_or(0),
        rating_count: book.rating_count.unwrap_or(0),
        cover: get_book_cover_url(s3_public, book.book_id),
        pdf: get_book_pdf_url(s3_public, book.book_id),
        samples: get_book_sample_pages_url(s3_public, book.book_id),
        category: BookCategoryRef {
            id: book.category_id.unwrap_or(0),
            name: book.category_name.unwrap_or_default(),
        },
        group: BookGroupRef {
            id: book.group_id.unwrap_or(0),
            name: book.group_name.unwrap_or_default(),
            short_name: book.group_short_name.unwrap_or_default(),
        },
        grade: BookGradeRef {
            id: book.grade_id.unwrap_or(0),
            name: book.grade_name.unwrap_or_default(),
            grade: book.grade_val.unwrap_or_default(),
        },
        user_interaction: if user_id.is_some() {
            Some(BookDetailUserInteraction {
                liked: book.liked.unwrap_or(false),
                disliked: book.disliked.unwrap_or(false),
                rating: book.user_rating.unwrap_or(0.0),
                bookmarked: book.bookmarked.unwrap_or(false),
                view_count: book.user_view_count.unwrap_or(0),
                download_count: book.user_download_count.unwrap_or(0),
            })
        } else {
            None
        },
        is_new: book.is_new,
        created_at: book
            .created_at
            .map(|d| d.to_rfc3339())
            .unwrap_or_else(|| now_iso.clone()),
        updated_at: book
            .updated_at
            .map(|d| d.to_rfc3339())
            .unwrap_or_else(|| now_iso),
    })
}
