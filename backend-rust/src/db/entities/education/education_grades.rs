use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "education_grades")]
pub struct Model {
    #[sea_orm(primary_key)]
    pub id: i32,
    pub grade: String,
    pub name: String,
    pub desc: Option<String>,
    pub extra: Option<Json>,
    pub created_by_user_id: Option<Uuid>,
    pub is_default: Option<bool>,
    pub created_at: Option<DateTimeWithTimeZone>,
    pub updated_at: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
