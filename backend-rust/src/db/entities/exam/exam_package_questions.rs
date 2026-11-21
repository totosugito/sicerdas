use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "exam_package_questions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub package_id: Uuid,
    #[sea_orm(primary_key, auto_increment = false)]
    pub question_id: Uuid,
    pub section_id: Uuid,
    pub order: i32,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
