use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "education_level")]
pub enum EducationLevel {
    #[sea_orm(string_value = "sd")]
    Sd,
    #[sea_orm(string_value = "smp")]
    Smp,
    #[sea_orm(string_value = "sma")]
    Sma,
    #[sea_orm(string_value = "university")]
    University,
    #[sea_orm(string_value = "other")]
    Other,
    #[sea_orm(string_value = "mts")]
    Mts,
    #[sea_orm(string_value = "smk")]
    Smk,
    #[sea_orm(string_value = "mi")]
    Mi,
    #[sea_orm(string_value = "stm")]
    Stm,
    #[sea_orm(string_value = "tk")]
    Tk,
    #[sea_orm(string_value = "paud")]
    Paud,
    #[sea_orm(string_value = "")]
    Unknown,
}

impl EducationLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            EducationLevel::Sd => "sd",
            EducationLevel::Smp => "smp",
            EducationLevel::Sma => "sma",
            EducationLevel::University => "university",
            EducationLevel::Other => "other",
            EducationLevel::Mts => "mts",
            EducationLevel::Smk => "smk",
            EducationLevel::Mi => "mi",
            EducationLevel::Stm => "stm",
            EducationLevel::Tk => "tk",
            EducationLevel::Paud => "paud",
            EducationLevel::Unknown => "",
        }
    }

    pub fn from_str_opt(s: &str) -> Option<Self> {
        match s {
            "sd" => Some(EducationLevel::Sd),
            "smp" => Some(EducationLevel::Smp),
            "sma" => Some(EducationLevel::Sma),
            "university" => Some(EducationLevel::University),
            "other" => Some(EducationLevel::Other),
            "mts" => Some(EducationLevel::Mts),
            "smk" => Some(EducationLevel::Smk),
            "mi" => Some(EducationLevel::Mi),
            "stm" => Some(EducationLevel::Stm),
            "tk" => Some(EducationLevel::Tk),
            "paud" => Some(EducationLevel::Paud),
            "" => Some(EducationLevel::Unknown),
            _ => None,
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "users_profiles")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub school: Option<String>,
    pub education_level: Option<EducationLevel>,
    pub grade: Option<String>,
    pub phone: Option<String>,
    pub address: Option<String>,
    pub bio: Option<String>,
    pub date_of_birth: Option<DateTimeWithTimeZone>,
    pub tier_id: Option<String>,
    pub extra: Option<Json>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
