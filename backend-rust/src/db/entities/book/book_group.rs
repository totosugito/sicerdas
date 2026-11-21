use crate::db::entities::app_version::ContentStatus;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "book_group")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub version_id: i32,
    pub category_id: i32,
    pub name: String,
    pub short_name: String,
    pub desc: Option<String>,
    pub extra: Option<Json>,
    pub status: ContentStatus,
    pub created_at: Option<DateTimeWithTimeZone>,
    pub updated_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
