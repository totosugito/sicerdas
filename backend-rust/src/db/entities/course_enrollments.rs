use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "enrollment_status")]
#[serde(rename_all = "lowercase")]
pub enum EnrollmentStatus {
    #[sea_orm(string_value = "active")]
    Active,
    #[sea_orm(string_value = "completed")]
    Completed,
    #[sea_orm(string_value = "dropped")]
    Dropped,
}

impl EnrollmentStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            EnrollmentStatus::Active => "active",
            EnrollmentStatus::Completed => "completed",
            EnrollmentStatus::Dropped => "dropped",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "course_enrollments")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub course_id: Uuid,
    pub user_id: Uuid,
    pub enrolled_at: DateTime,
    pub status: EnrollmentStatus,
    pub completed_at: Option<DateTime>,
    pub liked: Option<bool>,
    pub disliked: Option<bool>,
    pub rating: Option<Decimal>,
    pub bookmarked: Option<bool>,
    pub view_count: Option<i32>,
    pub extra: Option<Json>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
