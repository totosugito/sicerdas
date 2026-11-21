use crate::app::AppState;
use crate::db::entities::exam::{exam_package_event_stats, exam_package_interactions, exam_packages};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{RatingBody, RatingData, RatingUserInteraction};
use chrono::Utc;
use rust_decimal::Decimal;
use rust_decimal::prelude::FromPrimitive;
use rust_decimal::prelude::ToPrimitive;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};
use uuid::Uuid;

pub async fn user_rating(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: RatingBody,
) -> Result<RatingData, AppError> {
    let pkg = exam_packages::Entity::find_by_id(body.package_id)
        .filter(exam_packages::Column::IsActive.eq(true))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if pkg.is_none() {
        return Err(AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDetailNotFound)));
    }

    let existing = exam_package_interactions::Entity::find()
        .filter(exam_package_interactions::Column::UserId.eq(user_id))
        .filter(exam_package_interactions::Column::PackageId.eq(body.package_id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let old_rating = existing
        .as_ref()
        .and_then(|i| i.rating)
        .and_then(|r| r.to_f64())
        .unwrap_or(0.0);

    if (old_rating - body.rating).abs() < f64::EPSILON {
        let stats = exam_package_event_stats::Entity::find()
            .filter(exam_package_event_stats::Column::PackageId.eq(body.package_id))
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
        return Ok(RatingData {
            rating: stats
                .as_ref()
                .and_then(|s| s.rating.to_f64())
                .unwrap_or(0.0),
            rating_count: stats.map(|s| s.rating_count).unwrap_or(0),
            user_interaction: RatingUserInteraction { rating: old_rating },
        });
    }

    let now = Utc::now().fixed_offset();
    let new_rating_dec = Decimal::from_f64(body.rating)
        .unwrap_or(Decimal::ZERO)
        .round_dp(2);

    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    if let Some(existing_model) = existing {
        let mut active: exam_package_interactions::ActiveModel = existing_model.into();
        active.rating = Set(Some(new_rating_dec));
        active.updated_at = Set(now);
        active
            .update(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
    } else {
        let model = exam_package_interactions::ActiveModel {
            user_id: Set(user_id),
            package_id: Set(body.package_id),
            rating: Set(Some(new_rating_dec)),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };
        model
            .insert(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
    }

    let is_first_time = old_rating == 0.0;
    let diff = body.rating - old_rating;
    let diff_dec = Decimal::from_f64(diff).unwrap_or(Decimal::ZERO).round_dp(2);

    let existing_stats = exam_package_event_stats::Entity::find()
        .filter(exam_package_event_stats::Column::PackageId.eq(body.package_id))
        .one(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let (final_avg, final_count) = if let Some(stats_model) = existing_stats {
        let new_sum = (stats_model.rating_sum + diff_dec).max(Decimal::ZERO);
        let new_count = if is_first_time {
            stats_model.rating_count + 1
        } else {
            stats_model.rating_count
        };
        let new_avg = if new_count > 0 {
            (new_sum / Decimal::from(new_count)).round_dp(2)
        } else {
            Decimal::ZERO
        };

        let mut active: exam_package_event_stats::ActiveModel = stats_model.into();
        active.rating_sum = Set(new_sum);
        active.rating_count = Set(new_count);
        active.rating = Set(new_avg);
        active.updated_at = Set(now);
        active
            .update(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
        (new_avg.to_f64().unwrap_or(0.0), new_count)
    } else {
        let model = exam_package_event_stats::ActiveModel {
            package_id: Set(body.package_id),
            rating_sum: Set(new_rating_dec),
            rating_count: Set(1),
            rating: Set(new_rating_dec),
            created_at: Set(now),
            updated_at: Set(now),
            ..Default::default()
        };
        model
            .insert(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;
        (new_rating_dec.to_f64().unwrap_or(0.0), 1)
    };

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(RatingData {
        rating: final_avg,
        rating_count: final_count,
        user_interaction: RatingUserInteraction {
            rating: body.rating,
        },
    })
}
