use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "book_interactions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub user_id: Uuid,
    pub book_id: Uuid,
    pub liked: Option<bool>,
    pub disliked: Option<bool>,
    pub rating: Option<Decimal>,
    pub bookmarked: Option<bool>,
    pub view_count: Option<i32>,
    pub download_count: Option<i32>,
    pub extra: Option<Json>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
