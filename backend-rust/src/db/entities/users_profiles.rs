use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "users_profiles")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub school: Option<String>,
    pub grade: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub bio: Option<String>,
    pub date_of_birth: Option<DateTimeWithTimeZone>,
    pub tier_id: Option<String>,
    pub extra: Option<Json>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
