use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "exam_package_sections")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub package_id: Uuid,
    pub title: String,
    pub group_name: Option<String>,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub order: i32,
    pub created_by_user_id: Option<Uuid>,
    pub is_active: bool,
    pub version_id: Option<i32>,
    pub total_questions: i32,
    pub active_questions: i32,
    pub max_score: i32,
    pub question_limit: i32,
    pub is_random_item: bool,
    pub is_random_choice: bool,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
