use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "app_tier")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub slug: String,
    pub name: String,
    pub price: Decimal,
    pub currency: String,
    pub billing_cycle: String,
    pub features: Option<Json>,
    pub limits: Option<Json>,
    pub is_active: bool,
    pub sort_order: i32,
    pub is_popular: bool,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
