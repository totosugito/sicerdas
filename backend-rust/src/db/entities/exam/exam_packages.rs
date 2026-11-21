use super::enums::ExamType;
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "exam_packages")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub category_id: Uuid,
    pub title: String,
    pub exam_type: ExamType,
    pub created_by_user_id: Option<Uuid>,
    pub duration_minutes: i32,
    pub description: Option<String>,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: bool,
    pub version_id: Option<i32>,
    pub thumbnail: Option<String>,
    pub total_sections: i32,
    pub active_sections: i32,
    pub total_questions: i32,
    pub active_questions: i32,
    pub parent_package_id: Option<Uuid>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
