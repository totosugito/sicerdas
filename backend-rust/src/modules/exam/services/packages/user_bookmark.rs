use crate::app::AppState;
use crate::db::entities::exam::{exam_package_event_stats, exam_package_interactions, exam_packages};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{BookmarkBody, BookmarkData};
use chrono::Utc;
use sea_orm::sea_query::OnConflict;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};
use uuid::Uuid;

pub async fn user_bookmark(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: BookmarkBody,
) -> Result<BookmarkData, AppError> {
    let pkg = exam_packages::Entity::find_by_id(body.package_id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if pkg.is_none() {
        return Err(AppError::NotFound(translate(
            lang,
            LocaleKey::ExamPackagesDetailNotFound,
        )));
    }

    let existing = exam_package_interactions::Entity::find()
        .filter(exam_package_interactions::Column::UserId.eq(user_id))
        .filter(exam_package_interactions::Column::PackageId.eq(body.package_id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let currently_bookmarked = existing.as_ref().and_then(|i| i.bookmarked).unwrap_or(false);
    if currently_bookmarked == body.bookmarked {
        let stats = exam_package_event_stats::Entity::find()
            .filter(exam_package_event_stats::Column::PackageId.eq(body.package_id))
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
        return Ok(BookmarkData {
            bookmarked: currently_bookmarked,
            bookmark_count: stats.map(|s| s.bookmark_count).unwrap_or(0),
        });
    }

    let now = Utc::now().fixed_offset();
    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if let Some(existing_model) = existing {
        let mut active: exam_package_interactions::ActiveModel = existing_model.into();
        active.bookmarked = Set(Some(body.bookmarked));
        active.updated_at = Set(now);
        active
            .update(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
    } else {
        let model = exam_package_interactions::ActiveModel {
            user_id: Set(user_id),
            package_id: Set(body.package_id),
            bookmarked: Set(Some(body.bookmarked)),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };
        model
            .insert(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
    }

    let delta = if body.bookmarked { 1 } else { -1 };
    let existing_stats = exam_package_event_stats::Entity::find()
        .filter(exam_package_event_stats::Column::PackageId.eq(body.package_id))
        .one(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let final_count = if let Some(stats_model) = existing_stats {
        let new_count = (stats_model.bookmark_count + delta).max(0);
        let mut active: exam_package_event_stats::ActiveModel = stats_model.into();
        active.bookmark_count = Set(new_count);
        active.updated_at = Set(now);
        active
            .update(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
        new_count
    } else {
        let new_count = if body.bookmarked { 1 } else { 0 };
        let model = exam_package_event_stats::ActiveModel {
            package_id: Set(body.package_id),
            bookmark_count: Set(new_count),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };
        let _ = exam_package_event_stats::Entity::insert(model)
            .on_conflict(
                OnConflict::column(exam_package_event_stats::Column::PackageId)
                    .do_nothing()
                    .to_owned(),
            )
            .exec(&txn)
            .await;
        new_count
    };

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(BookmarkData {
        bookmarked: body.bookmarked,
        bookmark_count: final_count,
    })
}
