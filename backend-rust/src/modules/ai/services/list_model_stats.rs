use crate::app::AppState;
use crate::db::entities::{ai_api_logs, ai_models};
use crate::error::AppError;
use crate::modules::ai::types::{StatsLogItem, StatsMeta, StatsQuery};
use chrono::DateTime;
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect,
};
use std::collections::HashMap;
use uuid::Uuid;

pub async fn list_model_stats(
    state: &AppState,
    query: StatsQuery,
) -> Result<(Vec<StatsLogItem>, StatsMeta), AppError> {
    let limit = query.limit.unwrap_or(100).clamp(1, 500);
    let offset = query.offset.unwrap_or(0);

    let mut cond = Condition::all();
    if let Some(model_id) = query.model_id {
        cond = cond.add(ai_api_logs::Column::ModelId.eq(model_id));
    }
    if let Some(ps) = query
        .period_start
        .as_deref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
    {
        cond = cond.add(ai_api_logs::Column::PeriodStart.gte(ps));
    }
    if let Some(pe) = query
        .period_end
        .as_deref()
        .and_then(|s| DateTime::parse_from_rfc3339(s).ok())
    {
        cond = cond.add(ai_api_logs::Column::PeriodEnd.lte(pe));
    }

    let base = ai_api_logs::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;

    let asc = query.sort_order.as_deref() == Some("asc");
    let ordered = match query.sort_by.as_deref() {
        Some("totalRequests") => {
            if asc {
                base.order_by_asc(ai_api_logs::Column::TotalRequests)
            } else {
                base.order_by_desc(ai_api_logs::Column::TotalRequests)
            }
        }
        Some("successCount") => {
            if asc {
                base.order_by_asc(ai_api_logs::Column::SuccessCount)
            } else {
                base.order_by_desc(ai_api_logs::Column::SuccessCount)
            }
        }
        Some("failureCount") => {
            if asc {
                base.order_by_asc(ai_api_logs::Column::FailureCount)
            } else {
                base.order_by_desc(ai_api_logs::Column::FailureCount)
            }
        }
        Some("avgDuration") => {
            if asc {
                base.order_by_asc(ai_api_logs::Column::AvgDuration)
            } else {
                base.order_by_desc(ai_api_logs::Column::AvgDuration)
            }
        }
        Some("totalTokens") => {
            if asc {
                base.order_by_asc(ai_api_logs::Column::TotalTokens)
            } else {
                base.order_by_desc(ai_api_logs::Column::TotalTokens)
            }
        }
        _ => {
            if asc {
                base.order_by_asc(ai_api_logs::Column::PeriodStart)
            } else {
                base.order_by_desc(ai_api_logs::Column::PeriodStart)
            }
        }
    };

    let rows = ordered.offset(offset).limit(limit).all(&state.db).await?;

    let model_ids: Vec<Uuid> = rows.iter().map(|r| r.model_id).collect();
    let model_names: HashMap<Uuid, String> = if model_ids.is_empty() {
        HashMap::new()
    } else {
        ai_models::Entity::find()
            .filter(ai_models::Column::Id.is_in(model_ids))
            .all(&state.db)
            .await?
            .into_iter()
            .map(|m| (m.id, m.name))
            .collect()
    };

    let items = rows
        .into_iter()
        .map(|l| StatsLogItem {
            id: l.id,
            model_id: l.model_id,
            period_start: l.period_start.to_rfc3339(),
            period_end: l.period_end.to_rfc3339(),
            success_count: l.success_count,
            failure_count: l.failure_count,
            total_requests: l.total_requests,
            avg_duration: l.avg_duration.unwrap_or(0),
            total_tokens: l.total_tokens.unwrap_or(0),
            created_at: l.created_at.to_rfc3339(),
            model_name: model_names.get(&l.model_id).cloned(),
        })
        .collect();

    Ok((
        items,
        StatsMeta {
            total,
            limit,
            offset,
        },
    ))
}
