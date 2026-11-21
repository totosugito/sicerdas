use crate::app::AppState;
use crate::error::AppError;
use crate::modules::book::types::{
    BookCategoryRef, BookGradeRef, BookGroupRef, BookListBody, BookListData, BookListItem,
    BookUserInteraction,
};
use crate::modules::book::utils::{get_book_cover_url, get_latest_book_version_id};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct BookListRow {
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
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_book(
    state: &AppState,
    params: BookListBody,
    user_id: Option<Uuid>,
) -> Result<BookListData, AppError> {
    let page = params.page.unwrap_or(1).max(1);
    let limit = params.limit.unwrap_or(10).clamp(1, 20);
    let offset = (page - 1) * limit;

    let latest_version_id = get_latest_book_version_id(state).await?;

    let mut values: Vec<Value> = Vec::new();
    let mut where_clauses = vec!["b.status = 'published'::status".to_string()];

    if let Some(search) = params.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        values.push(format!("%{}%", search.to_lowercase()).into());
        let p = values.len();
        where_clauses.push(format!("(b.title ILIKE ${p} OR b.author ILIKE ${p})"));
    }

    if let Some(cats) = params.category.as_ref().filter(|v| !v.is_empty()) {
        let first = cats[0];
        if first == 0 {
            if let Some(vid) = latest_version_id {
                values.push(vid.into());
                let p = values.len();
                where_clauses.push(format!("b.version_id = ${p}"));
            }
        } else if first > 0 {
            let cat_filter: Vec<i32> = if cats.len() > 1 { vec![first] } else { cats.clone() };
            let placeholders: Vec<String> = cat_filter
                .into_iter()
                .map(|id| {
                    values.push(id.into());
                    format!("${}", values.len())
                })
                .collect();
            where_clauses.push(format!("bc.id IN ({})", placeholders.join(", ")));

            if let Some(groups) = params.group.as_ref().filter(|v| !v.is_empty()) {
                let g_ph: Vec<String> = groups
                    .iter()
                    .map(|id| {
                        values.push((*id).into());
                        format!("${}", values.len())
                    })
                    .collect();
                where_clauses.push(format!("bg.id IN ({})", g_ph.join(", ")));
            }

            if let Some(grades) = params.grade.as_ref().filter(|v| !v.is_empty()) {
                let gr_ph: Vec<String> = grades
                    .iter()
                    .map(|id| {
                        values.push((*id).into());
                        format!("${}", values.len())
                    })
                    .collect();
                where_clauses.push(format!("eg.id IN ({})", gr_ph.join(", ")));
            }
        }
    }

    let where_sql = where_clauses.join(" AND ");

    let count_sql = format!(
        r#"
        SELECT COUNT(*)::bigint AS total
        FROM books b
        LEFT JOIN book_group bg ON b.book_group_id = bg.id
        LEFT JOIN book_category bc ON bg.category_id = bc.id
        LEFT JOIN education_grades eg ON b.education_grade_id = eg.id
        WHERE {where_sql}
        "#
    );

    let count_row = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &count_sql,
        values.clone(),
    ))
    .one(&state.db)
    .await?
    .unwrap_or(CountRow { total: 0 });

    let total = count_row.total.max(0) as u64;
    let total_pages = if total == 0 { 0 } else { total.div_ceil(limit) };

    let sort_col = match params.sort_by.as_deref().unwrap_or("createdAt") {
        "title" => "b.title",
        "rating" => "bes.rating",
        "viewCount" => "bes.view_count",
        "downloadCount" => "bes.download_count",
        "bookmarkCount" => "bes.bookmark_count",
        "updatedAt" => "b.updated_at",
        _ => "b.created_at",
    };
    let sort_dir = if params.sort_order.as_deref() == Some("asc") {
        "ASC"
    } else {
        "DESC"
    };

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
            "bi.liked, bi.disliked, bi.rating::float8 AS user_rating, bi.bookmarked",
            format!("LEFT JOIN book_interactions bi ON b.id = bi.book_id AND bi.user_id = ${p}"),
        )
    } else {
        (
            "NULL::boolean AS liked, NULL::boolean AS disliked, NULL::float8 AS user_rating, NULL::boolean AS bookmarked",
            String::new(),
        )
    };

    values.push((limit as i64).into());
    let limit_ph = values.len();
    values.push((offset as i64).into());
    let offset_ph = values.len();

    let query_sql = format!(
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
        WHERE {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_ph} OFFSET ${offset_ph}
        "#
    );

    let rows = BookListRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        &query_sql,
        values,
    ))
    .all(&state.db)
    .await?;

    let s3_public = state.config.s3_public_url.as_deref();
    let now_iso = Utc::now().to_rfc3339();
    let is_logged_in = user_id.is_some();

    let items = rows
        .into_iter()
        .map(|row| BookListItem {
            id: row.id,
            book_id: row.book_id,
            title: row.title,
            description: row.description,
            author: Some(row.author),
            published_year: row.published_year,
            total_pages: row.total_pages,
            size: row.size,
            status: row.status,
            rating: row.rating,
            view_count: row.view_count,
            download_count: row.download_count,
            bookmark_count: row.bookmark_count,
            cover: get_book_cover_url(s3_public, row.book_id),
            category: BookCategoryRef {
                id: row.category_id.unwrap_or(0),
                name: row.category_name.unwrap_or_default(),
            },
            group: BookGroupRef {
                id: row.group_id.unwrap_or(0),
                name: row.group_name.unwrap_or_default(),
                short_name: row.group_short_name.unwrap_or_default(),
            },
            grade: BookGradeRef {
                id: row.grade_id.unwrap_or(0),
                name: row.grade_name.unwrap_or_default(),
                grade: row.grade_val.unwrap_or_default(),
            },
            user_interaction: if is_logged_in {
                Some(BookUserInteraction {
                    liked: row.liked.unwrap_or(false),
                    disliked: row.disliked.unwrap_or(false),
                    rating: row.user_rating.unwrap_or(0.0),
                    bookmarked: row.bookmarked.unwrap_or(false),
                })
            } else {
                None
            },
            is_new: row.is_new,
            created_at: row
                .created_at
                .map(|d| d.to_rfc3339())
                .unwrap_or_else(|| now_iso.clone()),
            updated_at: row
                .updated_at
                .map(|d| d.to_rfc3339())
                .unwrap_or_else(|| now_iso.clone()),
        })
        .collect();

    Ok(BookListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
