use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "ai_models")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub name: String,
    pub provider: String,
    pub model_identifier: String,
    pub api_key: Option<String>,
    pub description: Option<String>,
    pub max_tokens: Option<i32>,
    pub supports_image: bool,
    pub supports_file: bool,
    pub accepted_image_extensions: Option<Json>,
    pub accepted_file_extensions: Option<Json>,
    pub max_file_size: Option<i32>,
    pub tier_capabilities: Option<Json>,
    pub extra: Option<Json>,
    pub is_default: bool,
    pub is_enabled: bool,
    pub required_tier_id: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
