use crate::app::AppState;
use crate::db::entities::course_user_stats_global;
use crate::error::AppError;
use crate::modules::course::types::GlobalStatsData;
use rust_decimal::prelude::ToPrimitive;
use sea_orm::EntityTrait;
use uuid::Uuid;

pub async fn get_global_stats(
    state: &AppState,
    user_id: Uuid,
) -> Result<GlobalStatsData, AppError> {
    let stats = course_user_stats_global::Entity::find_by_id(user_id)
        .one(&state.db)
        .await?;

    Ok(match stats {
        Some(s) => GlobalStatsData {
            user_id,
            total_courses_enrolled: s.total_courses_enrolled,
            total_courses_completed: s.total_courses_completed,
            total_lectures_completed: s.total_lectures_completed,
            total_watch_time_minutes: s.total_watch_time_minutes.to_f64().unwrap_or(0.0),
            last_active_at: s.last_active_at.map(|d| d.to_rfc3339()),
        },
        None => GlobalStatsData {
            user_id,
            total_courses_enrolled: 0,
            total_courses_completed: 0,
            total_lectures_completed: 0,
            total_watch_time_minutes: 0.0,
            last_active_at: None,
        },
    })
}
