use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::middleware::auth::RequireAdmin;
use crate::modules::ai::services::list_model_stats::list_model_stats;
use crate::modules::ai::types::{StatsLogItem, StatsMeta, StatsQuery};
use axum::{
    extract::{Query, State},
    Json,
};
use serde::Serialize;

#[derive(Serialize)]
pub struct ModelsStatsResponse {
    pub success: bool,
    pub message: String,
    pub data: Vec<StatsLogItem>,
    pub meta: StatsMeta,
}

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    _admin: RequireAdmin,
    Query(query): Query<StatsQuery>,
) -> Result<Json<ModelsStatsResponse>, AppError> {
    let (data, meta) = list_model_stats(&state, query).await?;
    Ok(Json(ModelsStatsResponse {
        success: true,
        message: locale.t(LocaleKey::ChatAiModelStatsSuccess),
        data,
        meta,
    }))
}
