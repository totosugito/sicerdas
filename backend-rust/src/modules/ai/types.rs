use crate::db::entities::ai_models;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelResponseItem {
    pub id: Uuid,
    pub name: String,
    pub provider: String,
    pub description: Option<String>,
    pub model_identifier: String,
    pub max_tokens: Option<i32>,
    pub supports_image: bool,
    pub supports_file: bool,
    pub accepted_image_extensions: Option<Vec<String>>,
    pub accepted_file_extensions: Option<Vec<String>>,
    pub max_file_size: Option<i32>,
    pub is_default: bool,
    pub is_enabled: bool,
    pub required_tier_id: Option<String>,
    pub tier_capabilities: Option<Value>,
    pub created_at: String,
    pub updated_at: String,
}

impl From<ai_models::Model> for ModelResponseItem {
    fn from(m: ai_models::Model) -> Self {
        Self {
            id: m.id,
            name: m.name,
            provider: m.provider,
            description: m.description,
            model_identifier: m.model_identifier,
            max_tokens: m.max_tokens,
            supports_image: m.supports_image,
            supports_file: m.supports_file,
            accepted_image_extensions: m
                .accepted_image_extensions
                .and_then(|v| serde_json::from_value(v).ok()),
            accepted_file_extensions: m
                .accepted_file_extensions
                .and_then(|v| serde_json::from_value(v).ok()),
            max_file_size: m.max_file_size,
            is_default: m.is_default,
            is_enabled: m.is_enabled,
            required_tier_id: m.required_tier_id,
            tier_capabilities: m.tier_capabilities,
            created_at: m.created_at.to_rfc3339(),
            updated_at: m.updated_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelStatPoint {
    pub date: String,
    pub success_count: i32,
    pub total_requests: i32,
    pub avg_duration: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelDetailItem {
    #[serde(flatten)]
    pub model: ModelResponseItem,
    pub stats: Vec<ModelStatPoint>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelCreateBody {
    pub name: String,
    pub provider: String,
    pub model_identifier: String,
    pub api_key: Option<String>,
    pub description: Option<String>,
    pub max_tokens: Option<i32>,
    pub supports_image: Option<bool>,
    pub supports_file: Option<bool>,
    pub accepted_image_extensions: Option<Vec<String>>,
    pub accepted_file_extensions: Option<Vec<String>>,
    pub max_file_size: Option<i32>,
    pub is_default: Option<bool>,
    pub is_enabled: Option<bool>,
    pub required_tier_id: Option<String>,
    pub tier_capabilities: Option<Value>,
    pub extra: Option<Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ModelUpdateBody {
    pub name: Option<String>,
    pub provider: Option<String>,
    pub model_identifier: Option<String>,
    pub api_key: Option<String>,
    pub description: Option<String>,
    pub max_tokens: Option<i32>,
    pub supports_image: Option<bool>,
    pub supports_file: Option<bool>,
    pub accepted_image_extensions: Option<Vec<String>>,
    pub accepted_file_extensions: Option<Vec<String>>,
    pub max_file_size: Option<i32>,
    pub is_default: Option<bool>,
    pub is_enabled: Option<bool>,
    pub required_tier_id: Option<String>,
    pub tier_capabilities: Option<Value>,
    pub extra: Option<Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsQuery {
    pub model_id: Option<Uuid>,
    pub period_start: Option<String>,
    pub period_end: Option<String>,
    pub limit: Option<u64>,
    pub offset: Option<u64>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsLogItem {
    pub id: Uuid,
    pub model_id: Uuid,
    pub period_start: String,
    pub period_end: String,
    pub success_count: i32,
    pub failure_count: i32,
    pub total_requests: i32,
    pub avg_duration: i32,
    pub total_tokens: i32,
    pub created_at: String,
    pub model_name: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StatsMeta {
    pub total: u64,
    pub limit: u64,
    pub offset: u64,
}
