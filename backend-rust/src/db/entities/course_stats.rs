use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "course_stats")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub course_id: Uuid,
    pub total_chapters: i32,
    pub total_lectures: i32,
    pub total_students: i32,
    pub total_ratings: i32,
    pub rating_count: i32,
    pub rating_sum: Decimal,
    pub average_rating: Decimal,
    pub last_updated: DateTime,
    pub extra: Option<Json>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
