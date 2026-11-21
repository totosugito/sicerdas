use sea_orm::entity::prelude::*;

#[derive(Clone, Debug, PartialEq, Eq, DeriveEntityModel)]
#[sea_orm(table_name = "exam_session_answers")]
pub struct Model {
    #[sea_orm(primary_key, auto_increment = false)]
    pub id: Uuid,
    pub session_id: Uuid,
    pub question_id: Uuid,
    pub question_order: i32,
    pub variation_index: i32,
    pub selected_option_id: Option<Uuid>,
    pub text_answer: Option<Json>,
    pub is_correct: Option<bool>,
    pub is_doubtful: bool,
    pub shuffled_options_order: Option<Json>,
    pub created_at: DateTimeWithTimeZone,
    pub updated_at: DateTimeWithTimeZone,
}

#[derive(Copy, Clone, Debug, EnumIter, DeriveRelation)]
pub enum Relation {}

impl ActiveModelBehavior for ActiveModel {}
