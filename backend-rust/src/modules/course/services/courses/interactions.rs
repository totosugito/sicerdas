use crate::app::AppState;
use crate::db::entities::course_enrollments;
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{
    CourseInteractionData, FavoriteCourseItem, FavoriteCourseListData,
};
use crate::modules::course::utils::get_course_thumbnail_url;
use crate::types::response::PaginationMeta;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, FromQueryResult,
    QueryFilter, Set, Statement,
};
use uuid::Uuid;

pub async fn toggle_bookmark(
    state: &AppState,
    lang: Lang,
    course_id: Uuid,
    user_id: Uuid,
) -> Result<CourseInteractionData, AppError> {
    let enrollment = course_enrollments::Entity::find()
        .filter(course_enrollments::Column::CourseId.eq(course_id))
        .filter(course_enrollments::Column::UserId.eq(user_id))
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::Forbidden(locales::translate(lang, LocaleKey::AuthForbidden))
        })?;

    let new_status = !enrollment.bookmarked.unwrap_or(false);
    let mut active: course_enrollments::ActiveModel = enrollment.into();
    active.bookmarked = Set(Some(new_status));
    active.update(&state.db).await?;

    Ok(CourseInteractionData {
        course_id,
        user_id,
        rating: None,
        bookmarked: Some(new_status),
        liked: None,
        disliked: None,
    })
}

pub async fn toggle_like(
    state: &AppState,
    lang: Lang,
    course_id: Uuid,
    user_id: Uuid,
) -> Result<CourseInteractionData, AppError> {
    let enrollment = course_enrollments::Entity::find()
        .filter(course_enrollments::Column::CourseId.eq(course_id))
        .filter(course_enrollments::Column::UserId.eq(user_id))
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::Forbidden(locales::translate(lang, LocaleKey::AuthForbidden))
        })?;

    let new_liked = !enrollment.liked.unwrap_or(false);
    let new_disliked = if new_liked {
        false
    } else {
        enrollment.disliked.unwrap_or(false)
    };
    let mut active: course_enrollments::ActiveModel = enrollment.into();
    active.liked = Set(Some(new_liked));
    active.disliked = Set(Some(new_disliked));
    active.update(&state.db).await?;

    Ok(CourseInteractionData {
        course_id,
        user_id,
        rating: None,
        bookmarked: None,
        liked: Some(new_liked),
        disliked: Some(new_disliked),
    })
}

pub async fn rate_course(
    state: &AppState,
    lang: Lang,
    course_id: Uuid,
    user_id: Uuid,
    rating: f64,
) -> Result<CourseInteractionData, AppError> {
    if !(0.0..=5.0).contains(&rating) {
        return Err(AppError::BadRequest(
            "Rating must be between 0 and 5".to_string(),
        ));
    }

    let enrollment = course_enrollments::Entity::find()
        .filter(course_enrollments::Column::CourseId.eq(course_id))
        .filter(course_enrollments::Column::UserId.eq(user_id))
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::Forbidden(locales::translate(lang, LocaleKey::AuthForbidden))
        })?;

    use rust_decimal::prelude::ToPrimitive;
    let old_rating = enrollment
        .rating
        .and_then(|d| d.to_f64())
        .unwrap_or(0.0);

    if (old_rating - rating).abs() < f64::EPSILON {
        return Ok(CourseInteractionData {
            course_id,
            user_id,
            rating: Some(rating),
            bookmarked: None,
            liked: None,
            disliked: None,
        });
    }

    let rating_str = format!("{:.2}", rating);
    state
        .db
        .execute(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "UPDATE course_enrollments SET rating = $1::numeric WHERE id = $2",
            vec![rating_str.clone().into(), enrollment.id.into()],
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
            INSERT INTO course_stats (course_id, total_ratings, rating_count, rating_sum, average_rating, last_updated)
            VALUES ($1, 1, 1, $2::numeric, $2::numeric, NOW())
            ON CONFLICT (course_id) DO UPDATE
            SET rating_sum = course_stats.rating_sum + $3::numeric,
                total_ratings = course_stats.total_ratings + $4,
                rating_count = course_stats.rating_count + $4,
                last_updated = NOW()
            "#,
            vec![
                course_id.into(),
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
            UPDATE course_stats
            SET average_rating = CASE WHEN total_ratings > 0 THEN rating_sum / total_ratings ELSE 0 END
            WHERE course_id = $1
            "#,
            vec![course_id.into()],
        ))
        .await?;

    Ok(CourseInteractionData {
        course_id,
        user_id,
        rating: Some(rating),
        bookmarked: None,
        liked: None,
        disliked: None,
    })
}

#[derive(Debug, FromQueryResult)]
struct FavCourseRow {
    id: Uuid,
    course_code: String,
    course_name: String,
    course_description: Option<String>,
    thumbnail: Option<String>,
    price: Option<i32>,
    bookmarked: Option<bool>,
    liked: Option<bool>,
    rating: Option<f64>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn list_favorites(
    state: &AppState,
    user_id: Uuid,
    page: u64,
    limit: u64,
) -> Result<FavoriteCourseListData, AppError> {
    let page = page.max(1);
    let limit = limit.clamp(1, 100);
    let offset = (page - 1) * limit;

    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT COUNT(*)::bigint AS total
        FROM course_enrollments
        WHERE user_id = $1 AND (bookmarked = true OR liked = true)
        "#,
        vec![user_id.into()],
    ))
    .one(&state.db)
    .await?
    .map(|r| r.total.max(0) as u64)
    .unwrap_or(0);

    let total_pages = if total == 0 { 0 } else { total.div_ceil(limit) };

    let rows = FavCourseRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            c.id,
            c.course_code,
            c.course_name,
            c.course_description,
            c.thumbnail,
            c.price,
            ce.bookmarked,
            ce.liked,
            ce.rating::float8 AS rating
        FROM course_enrollments ce
        INNER JOIN courses c ON ce.course_id = c.id
        WHERE ce.user_id = $1 AND (ce.bookmarked = true OR ce.liked = true)
        ORDER BY ce.enrolled_at DESC
        LIMIT $2 OFFSET $3
        "#,
        vec![user_id.into(), (limit as i64).into(), (offset as i64).into()],
    ))
    .all(&state.db)
    .await?;

    let items = rows
        .into_iter()
        .map(|r| FavoriteCourseItem {
            id: r.id,
            course_code: r.course_code,
            course_name: r.course_name,
            course_description: r.course_description,
            thumbnail: get_course_thumbnail_url(state, r.thumbnail.as_deref()),
            price: r.price.unwrap_or(0),
            bookmarked: r.bookmarked.unwrap_or(false),
            liked: r.liked.unwrap_or(false),
            rating: r.rating,
        })
        .collect();

    Ok(FavoriteCourseListData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
