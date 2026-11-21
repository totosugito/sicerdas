use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "UserRole")]
pub enum UserRole {
    #[sea_orm(string_value = "admin")]
    Admin,
    #[sea_orm(string_value = "teacher")]
    Teacher,
    #[sea_orm(string_value = "user")]
    User,
    #[sea_orm(string_value = "guest")]
    Guest,
}

impl UserRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            UserRole::Admin => "admin",
            UserRole::Teacher => "teacher",
            UserRole::User => "user",
            UserRole::Guest => "guest",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "users")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub email: String,
    pub email_verified: bool,
    pub name: String,
    pub role: UserRole,
    pub image: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
    pub banned: bool,
    pub ban_reason: Option<String>,
    pub ban_expires: Option<DateTimeWithTimeZone>,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
