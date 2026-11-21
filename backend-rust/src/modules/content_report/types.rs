use crate::db::entities::app_version::ContentType;
use crate::db::entities::content_report::content_report::ReportReason;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReportBody {
    pub name: String,
    pub email: String,
    pub title: String,
    pub content_type: ContentType,
    pub reference_id: Uuid,
    pub reason: ReportReason,
    pub description: Option<String>,
    pub extra: Option<Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateReportData {
    pub id: Uuid,
}
