use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "users_accounts")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub account_id: String,
    pub provider_id: String,
    pub user_id: Uuid,
    pub access_token: Option<String>,
    pub refresh_token: Option<String>,
    pub id_token: Option<String>,
    pub access_token_expires_at: Option<DateTimeWithTimeZone>,
    pub refresh_token_expires_at: Option<DateTimeWithTimeZone>,
    pub scope: Option<String>,
    pub password: Option<String>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
