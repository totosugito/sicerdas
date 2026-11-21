use crate::db::entities::app_version::ContentType;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "report_reason")]
#[serde(rename_all = "lowercase")]
pub enum ReportReason {
    #[sea_orm(string_value = "duplicate")]
    Duplicate,
    #[sea_orm(string_value = "error")]
    Error,
    #[sea_orm(string_value = "unknown")]
    Unknown,
    #[sea_orm(string_value = "inappropriate")]
    Inappropriate,
    #[sea_orm(string_value = "spam")]
    Spam,
    #[sea_orm(string_value = "copyright")]
    Copyright,
    #[sea_orm(string_value = "other")]
    Other,
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "report_status")]
#[serde(rename_all = "snake_case")]
pub enum ReportStatus {
    #[sea_orm(string_value = "pending")]
    Pending,
    #[sea_orm(string_value = "in_review")]
    InReview,
    #[sea_orm(string_value = "violate")]
    Violate,
    #[sea_orm(string_value = "duplicate")]
    Duplicate,
    #[sea_orm(string_value = "resolved")]
    Resolved,
    #[sea_orm(string_value = "dismissed")]
    Dismissed,
    #[sea_orm(string_value = "error")]
    Error,
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "content_report")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub reporter_id: Option<Uuid>,
    pub name: String,
    pub email: String,
    pub title: String,
    pub content_type: ContentType,
    pub reference_id: Uuid,
    pub reason: ReportReason,
    pub description: Option<String>,
    pub status: ReportStatus,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
    pub extra: Option<Json>,
    pub resolved_at: Option<DateTimeWithTimeZone>,
    pub resolved_by: Option<Uuid>,
    pub resolution_notes: Option<String>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
