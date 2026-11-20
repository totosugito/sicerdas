use crate::db::entities::app_version::{self, ContentStatus, ContentType};
use crate::types::response::PaginationMeta;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct VersionItem {
    pub id: i32,
    pub app_version: i32,
    pub db_version: i32,
    pub data_type: ContentType,
    pub status: ContentStatus,
    pub name: String,
    pub note: Vec<Value>,
    pub extra: Value,
    pub created_at: String,
    pub updated_at: String,
}

impl From<app_version::Model> for VersionItem {
    fn from(v: app_version::Model) -> Self {
        let note = serde_json::from_value::<Vec<Value>>(v.note).unwrap_or_default();
        Self {
            id: v.id,
            app_version: v.app_version,
            db_version: v.db_version,
            data_type: v.data_type,
            status: v.status,
            name: v.name.unwrap_or_default(),
            note,
            extra: v.extra.unwrap_or_else(|| json!({})),
            created_at: v
                .created_at
                .map(|d| d.to_rfc3339())
                .unwrap_or_else(|| Utc::now().to_rfc3339()),
            updated_at: v
                .updated_at
                .map(|d| d.to_rfc3339())
                .unwrap_or_else(|| Utc::now().to_rfc3339()),
        }
    }
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListVersionBody {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub search: Option<String>,
    pub data_type: Option<ContentType>,
    pub status: Option<ContentStatus>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListVersionData {
    pub items: Vec<VersionItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListVersionSimpleBody {
    pub data_type: ContentType,
    pub search: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct VersionSimpleItem {
    pub id: i32,
    pub name: String,
    pub published: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ListVersionSimpleData {
    pub items: Vec<VersionSimpleItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateVersionBody {
    pub app_version: i32,
    pub db_version: i32,
    pub data_type: ContentType,
    pub status: Option<ContentStatus>,
    pub name: String,
    pub note: Option<Vec<Value>>,
    pub extra: Option<Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateVersionBody {
    pub app_version: Option<i32>,
    pub db_version: Option<i32>,
    pub status: Option<ContentStatus>,
    pub name: Option<String>,
    pub note: Option<Vec<Value>>,
    pub extra: Option<Value>,
}
