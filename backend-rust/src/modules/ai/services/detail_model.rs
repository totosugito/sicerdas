use crate::app::AppState;
use crate::db::entities::{ai_api_logs, ai_models};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::ai::types::{ModelDetailItem, ModelResponseItem, ModelStatPoint};
use sea_orm::{ColumnTrait, EntityTrait, QueryFilter, QueryOrder, QuerySelect};
use uuid::Uuid;

pub async fn get_model_detail(
    state: &AppState,
    id: Uuid,
    locale: RequestLocale,
) -> Result<ModelDetailItem, AppError> {
    let model = ai_models::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::ChatAiModelDetailNotFound)))?;

    let logs = ai_api_logs::Entity::find()
        .filter(ai_api_logs::Column::ModelId.eq(id))
        .order_by_desc(ai_api_logs::Column::PeriodStart)
        .limit(5)
        .all(&state.db)
        .await?;

    let stats = logs
        .into_iter()
        .map(|l| ModelStatPoint {
            date: l.period_start.to_rfc3339(),
            success_count: l.success_count,
            total_requests: l.total_requests,
            avg_duration: l.avg_duration.unwrap_or(0),
        })
        .collect();

    Ok(ModelDetailItem {
        model: ModelResponseItem::from(model),
        stats,
    })
}
