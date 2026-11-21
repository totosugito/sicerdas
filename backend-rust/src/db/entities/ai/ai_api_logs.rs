use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "ai_api_logs")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub model_id: Uuid,
    pub period_start: DateTimeWithTimeZone,
    pub period_end: DateTimeWithTimeZone,
    pub success_count: i32,
    pub failure_count: i32,
    pub total_requests: i32,
    pub avg_duration: Option<i32>,
    pub total_tokens: Option<i32>,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
