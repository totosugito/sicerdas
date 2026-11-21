use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "course_user_stats_global")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub user_id: Uuid,
    pub total_courses_enrolled: i32,
    pub total_courses_completed: i32,
    pub total_lectures_completed: i32,
    pub total_watch_time_minutes: Decimal,
    pub last_active_at: Option<DateTimeWithTimeZone>,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
