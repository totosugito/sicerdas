use crate::db::entities::{education_categories, education_grades};
use crate::types::response::PaginationMeta;
use chrono::Utc;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use uuid::Uuid;

// --- Categories ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryData {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

impl From<education_categories::Model> for CategoryData {
    fn from(c: education_categories::Model) -> Self {
        Self {
            id: c.id,
            name: c.name,
            description: c.description,
            is_active: c.is_active,
            created_at: c.created_at.to_rfc3339(),
            updated_at: c.updated_at.to_rfc3339(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CategorySimpleData {
    pub value: Uuid,
    pub label: String,
    pub key: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryListBody {
    pub search: Option<String>,
    pub is_active: Option<bool>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CategorySimpleBody {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateCategoryBody {
    pub name: String,
    pub key: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateCategoryBody {
    pub name: String,
    pub key: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

// --- Grades ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradeData {
    pub id: i32,
    pub grade: String,
    pub name: String,
    pub desc: Option<String>,
    pub extra: Value,
    pub is_default: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl From<education_grades::Model> for GradeData {
    fn from(g: education_grades::Model) -> Self {
        Self {
            id: g.id,
            grade: g.grade,
            name: g.name,
            desc: g.desc,
            extra: g.extra.unwrap_or_else(|| json!({})),
            is_default: g.is_default.unwrap_or(true),
            created_at: g
                .created_at
                .map(|d| d.to_rfc3339())
                .or_else(|| Some(Utc::now().to_rfc3339())),
            updated_at: g
                .updated_at
                .map(|d| d.to_rfc3339())
                .or_else(|| Some(Utc::now().to_rfc3339())),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradeSimpleData {
    pub value: String,
    pub label: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradeListBody {
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GradeSimpleBody {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub is_default: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateGradeBody {
    pub grade: String,
    pub name: String,
    pub desc: Option<String>,
    pub extra: Option<Value>,
    pub is_default: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateGradeBody {
    pub name: Option<String>,
    pub desc: Option<String>,
    pub extra: Option<Value>,
    pub is_default: Option<bool>,
}

// --- Tags ---

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TagData {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub total_questions: i64,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TagSimpleData {
    pub value: String,
    pub label: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TagListBody {
    pub search: Option<String>,
    pub is_active: Option<bool>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TagSimpleBody {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateTagBody {
    pub name: String,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateTagBody {
    pub name: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedData<T> {
    pub items: Vec<T>,
    pub meta: PaginationMeta,
}
