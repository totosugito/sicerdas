use super::enums::{ExamSessionMode, ExamSessionStatus};
use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "exam_sessions")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub user_id: Uuid,
    pub package_id: Uuid,
    pub section_id: Uuid,
    pub status: ExamSessionStatus,
    pub mode: ExamSessionMode,
    pub start_time: DateTimeWithTimeZone,
    pub end_time: Option<DateTimeWithTimeZone>,
    pub elapsed_seconds: i32,
    pub is_timer_active: bool,
    pub is_answers_purged: bool,
    pub total_correct: i32,
    pub total_wrong: i32,
    pub total_skipped: i32,
    pub earned_points: Decimal,
    pub max_points: Decimal,
    pub score: Option<Decimal>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
