use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "book_event_stats")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    #[sea_orm(unique)]
    pub book_id: Uuid,
    pub view_count: i32,
    pub download_count: i32,
    pub like_count: i32,
    pub dislike_count: i32,
    pub share_count: i32,
    pub bookmark_count: i32,
    pub rating_count: i32,
    pub rating_sum: Decimal,
    pub rating: Decimal,
    pub legacy_stats: Option<Json>,
    pub extra: Option<Json>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
