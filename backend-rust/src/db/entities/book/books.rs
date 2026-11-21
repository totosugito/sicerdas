use crate::db::entities::app_version::ContentStatus;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "books")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    #[sea_orm(unique)]
    pub book_id: i32,
    pub version_id: i32,
    pub book_group_id: i32,
    pub education_grade_id: i32,
    pub title: String,
    pub description: Option<String>,
    pub author: String,
    pub published_year: String,
    pub total_pages: i32,
    pub size: i32,
    pub status: ContentStatus,
    pub extra: Option<Json>,
    pub created_at: Option<DateTimeWithTimeZone>,
    pub updated_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
