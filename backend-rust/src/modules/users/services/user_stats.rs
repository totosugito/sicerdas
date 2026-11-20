use crate::app::AppState;
use crate::db::entities::users;
use crate::db::entities::users_stats::{self, StatsPeriodType};
use crate::error::AppError;
use crate::modules::users::types::{
    GetUserStatsQuery, UserStatsData, UserStatsItem, UserStatsKpi,
};
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect};
use serde_json::json;

pub async fn get_user_stats(
    state: &AppState,
    query: GetUserStatsQuery,
) -> Result<UserStatsData, AppError> {
    let period_type = query.period_type.unwrap_or(StatsPeriodType::Daily);
    let limit = query.limit.unwrap_or(12).clamp(1, 100);

    let latest_res = users_stats::Entity::find()
        .order_by_desc(users_stats::Column::CreatedAt)
        .one(&state.db)
        .await;

    let latest = match latest_res {
        Ok(val) => val,
        Err(e) if e.to_string().contains("users_stats") => {
            let total = users::Entity::find().count(&state.db).await? as i32;
            let banned = users::Entity::find()
                .filter(users::Column::Banned.eq(true))
                .count(&state.db)
                .await? as i32;
            return Ok(UserStatsData {
                kpi: UserStatsKpi {
                    total_users: total,
                    active_users: (total - banned).max(0),
                    banned_users: banned,
                    role_breakdown: json!({ "admin": 0, "teacher": 0, "user": 0, "guest": 0 }),
                    tier_breakdown: json!({}),
                },
                history: Vec::new(),
            });
        }
        Err(e) => return Err(AppError::from(e)),
    };

    let kpi = match latest {
        Some(row) => UserStatsKpi {
            total_users: row.total_users_count,
            active_users: row.active_users_count,
            banned_users: row.banned_users_count,
            role_breakdown: row.role_breakdown,
            tier_breakdown: row.tier_breakdown,
        },
        None => UserStatsKpi {
            total_users: 0,
            active_users: 0,
            banned_users: 0,
            role_breakdown: json!({ "admin": 0, "teacher": 0, "user": 0, "guest": 0 }),
            tier_breakdown: json!({}),
        },
    };

    let mut rows = users_stats::Entity::find()
        .filter(users_stats::Column::PeriodType.eq(period_type))
        .order_by_desc(users_stats::Column::PeriodKey)
        .limit(limit)
        .all(&state.db)
        .await?;
    rows.reverse();

    let history = rows
        .into_iter()
        .map(|row| UserStatsItem {
            id: row.id,
            period_type: row.period_type.as_str().to_string(),
            period_key: row.period_key,
            date: row.date.to_string(),
            new_users_count: row.new_users_count,
            total_users_count: row.total_users_count,
            active_users_count: row.active_users_count,
            banned_users_count: row.banned_users_count,
            role_breakdown: row.role_breakdown,
            tier_breakdown: row.tier_breakdown,
            education_breakdown: row.education_breakdown,
            created_at: row.created_at.to_rfc3339(),
        })
        .collect();

    Ok(UserStatsData { kpi, history })
}
