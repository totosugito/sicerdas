use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "course_chapters")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub chapter_name: Option<String>,
    pub course_id: Uuid,
    pub created_by_user_id: Option<Uuid>,
    pub extra: Option<Json>,
    pub is_active: bool,
    pub position: String,
    pub total_lectures: i32,
    pub active_lectures: i32,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
