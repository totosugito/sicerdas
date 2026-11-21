use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "data_type")]
#[serde(rename_all = "lowercase")]
pub enum ContentType {
    #[sea_orm(string_value = "book")]
    Book,
    #[sea_orm(string_value = "exam")]
    Exam,
    #[sea_orm(string_value = "test")]
    Test,
    #[sea_orm(string_value = "course")]
    Course,
    #[sea_orm(string_value = "other")]
    Other,
}

impl ContentType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ContentType::Book => "book",
            ContentType::Exam => "exam",
            ContentType::Test => "test",
            ContentType::Course => "course",
            ContentType::Other => "other",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "status")]
#[serde(rename_all = "lowercase")]
pub enum ContentStatus {
    #[sea_orm(string_value = "draft")]
    Draft,
    #[sea_orm(string_value = "published")]
    Published,
    #[sea_orm(string_value = "unpublished")]
    Unpublished,
    #[sea_orm(string_value = "finished")]
    Finished,
    #[sea_orm(string_value = "archived")]
    Archived,
    #[sea_orm(string_value = "deleted")]
    Deleted,
}

impl ContentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ContentStatus::Draft => "draft",
            ContentStatus::Published => "published",
            ContentStatus::Unpublished => "unpublished",
            ContentStatus::Finished => "finished",
            ContentStatus::Archived => "archived",
            ContentStatus::Deleted => "deleted",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "app_version")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub app_version: i32,
    pub db_version: i32,
    pub data_type: ContentType,
    pub status: ContentStatus,
    pub name: Option<String>,
    pub note: Json,
    pub extra: Option<Json>,
    pub created_at: Option<DateTimeWithTimeZone>,
    pub updated_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
