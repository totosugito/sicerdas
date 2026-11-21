use crate::db::entities::app_version::ContentStatus;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "publish_date_type")]
#[serde(rename_all = "lowercase")]
pub enum PublishDateType {
    #[sea_orm(string_value = "now")]
    Now,
    #[sea_orm(string_value = "date")]
    Date,
}

impl PublishDateType {
    pub fn as_str(&self) -> &'static str {
        match self {
            PublishDateType::Now => "now",
            PublishDateType::Date => "date",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "courses")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub created_by_user_id: Option<Uuid>,
    #[sea_orm(unique)]
    pub course_code: String,
    pub course_name: String,
    pub course_description: Option<String>,
    pub what_you_will_learn: Option<String>,
    pub price: Option<i32>,
    pub thumbnail: Option<String>,
    pub category_id: Uuid,
    pub education_grade_id: i32,
    pub tags: Option<Vec<String>>,
    pub instructions: Option<String>,
    pub status: Option<ContentStatus>,
    pub publish_date_type: Option<PublishDateType>,
    pub publish_date_start: Option<DateTime>,
    pub publish_date_end: Option<DateTime>,
    pub is_public: bool,
    pub is_sequential: bool,
    pub total_chapters: i32,
    pub active_chapters: i32,
    pub total_lectures: i32,
    pub active_lectures: i32,
    pub version_id: Option<i32>,
    pub extra: Option<Json>,
    pub created_at: DateTime,
    pub updated_at: DateTime,
    pub deleted_at: Option<DateTime>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
