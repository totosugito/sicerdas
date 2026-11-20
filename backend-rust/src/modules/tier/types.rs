use crate::db::entities::app_tier;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TierItem {
    pub slug: String,
    pub name: String,
    pub price: String,
    pub currency: String,
    pub billing_cycle: String,
    pub features: Vec<String>,
    pub limits: Value,
    pub is_active: bool,
    pub sort_order: i32,
    pub is_popular: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<app_tier::Model> for TierItem {
    fn from(t: app_tier::Model) -> Self {
        let features = t
            .features
            .and_then(|v| serde_json::from_value::<Vec<String>>(v).ok())
            .unwrap_or_default();
        Self {
            slug: t.slug,
            name: t.name,
            price: t.price.to_string(),
            currency: t.currency,
            billing_cycle: t.billing_cycle,
            features,
            limits: t.limits.unwrap_or_else(|| json!({})),
            is_active: t.is_active,
            sort_order: t.sort_order,
            is_popular: t.is_popular,
            created_at: t.created_at.to_rfc3339(),
            updated_at: t.updated_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTierBody {
    pub slug: String,
    pub name: String,
    pub price: String,
    pub currency: Option<String>,
    pub billing_cycle: Option<String>,
    pub features: Option<Vec<String>>,
    pub limits: Option<Value>,
    pub is_active: Option<bool>,
    pub sort_order: Option<i32>,
    pub is_popular: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTierBody {
    pub name: Option<String>,
    pub price: Option<String>,
    pub currency: Option<String>,
    pub billing_cycle: Option<String>,
    pub features: Option<Vec<String>>,
    pub limits: Option<Value>,
    pub is_active: Option<bool>,
    pub sort_order: Option<i32>,
    pub is_popular: Option<bool>,
}
