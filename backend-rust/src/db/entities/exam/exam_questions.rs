use super::enums::{DifficultyLevel, QuestionType, ScoringStrategy};
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "exam_questions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub passage_id: Option<Uuid>,
    pub subject_id: Uuid,
    pub content: Json,
    pub reason_content: Option<Json>,
    pub variable_formulas: Option<Json>,
    pub difficulty: DifficultyLevel,
    pub r#type: QuestionType,
    pub max_score: i32,
    pub scoring_strategy: ScoringStrategy,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub created_by_user_id: Option<Uuid>,
    pub is_active: bool,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
