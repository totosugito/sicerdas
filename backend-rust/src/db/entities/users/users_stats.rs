use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "stats_period_type")]
#[serde(rename_all = "lowercase")]
pub enum StatsPeriodType {
    #[sea_orm(string_value = "daily")]
    Daily,
    #[sea_orm(string_value = "weekly")]
    Weekly,
    #[sea_orm(string_value = "monthly")]
    Monthly,
}

impl StatsPeriodType {
    pub fn as_str(&self) -> &'static str {
        match self {
            StatsPeriodType::Daily => "daily",
            StatsPeriodType::Weekly => "weekly",
            StatsPeriodType::Monthly => "monthly",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "users_stats")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub period_type: StatsPeriodType,
    pub period_key: String,
    pub date: Date,
    pub new_users_count: i32,
    pub total_users_count: i32,
    pub active_users_count: i32,
    pub banned_users_count: i32,
    pub role_breakdown: Json,
    pub tier_breakdown: Json,
    pub education_breakdown: Json,
    pub created_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
