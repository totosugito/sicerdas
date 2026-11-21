use crate::db::entities::app_version::ContentType;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "event_status")]
#[serde(rename_all = "lowercase")]
pub enum EventStatus {
    #[sea_orm(string_value = "view")]
    View,
    #[sea_orm(string_value = "download")]
    Download,
    #[sea_orm(string_value = "like")]
    Like,
    #[sea_orm(string_value = "dislike")]
    Dislike,
    #[sea_orm(string_value = "share")]
    Share,
    #[sea_orm(string_value = "comment")]
    Comment,
    #[sea_orm(string_value = "bookmark")]
    Bookmark,
    #[sea_orm(string_value = "rating")]
    Rating,
    #[sea_orm(string_value = "other")]
    Other,
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "app_event_history")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub user_id: Option<Uuid>,
    pub action: EventStatus,
    pub content_type: ContentType,
    pub reference_id: Uuid,
    pub session_id: Option<Uuid>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
