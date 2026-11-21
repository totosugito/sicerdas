use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "exam_package_event_stats")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    #[sea_orm(unique)]
    pub package_id: Uuid,
    pub view_count: i32,
    pub like_count: i32,
    pub dislike_count: i32,
    pub share_count: i32,
    pub bookmark_count: i32,
    pub rating_count: i32,
    pub rating_sum: Decimal,
    pub rating: Decimal,
    pub extra: Option<Json>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
