use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "lecture_type")]
#[serde(rename_all = "lowercase")]
pub enum LectureType {
    #[sea_orm(string_value = "video")]
    Video,
    #[sea_orm(string_value = "exam")]
    Exam,
    #[sea_orm(string_value = "text")]
    Text,
    #[sea_orm(string_value = "pdf")]
    Pdf,
    #[sea_orm(string_value = "discussion")]
    Discussion,
    #[sea_orm(string_value = "other")]
    Other,
}

impl LectureType {
    pub fn as_str(&self) -> &'static str {
        match self {
            LectureType::Video => "video",
            LectureType::Exam => "exam",
            LectureType::Text => "text",
            LectureType::Pdf => "pdf",
            LectureType::Discussion => "discussion",
            LectureType::Other => "other",
        }
    }
}

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "course_lectures")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub title: Option<String>,
    pub description: Option<String>,
    pub chapter_id: Uuid,
    pub created_by_user_id: Option<Uuid>,
    pub r#type: LectureType,
    pub reference_url: Option<String>,
    pub extra: Option<Json>,
    pub is_active: bool,
    pub position: Decimal,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
