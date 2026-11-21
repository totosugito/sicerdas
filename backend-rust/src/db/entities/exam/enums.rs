use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "exam_type")]
#[serde(rename_all = "snake_case")]
pub enum ExamType {
    #[sea_orm(string_value = "official")]
    Official,
    #[sea_orm(string_value = "custom_practice")]
    CustomPractice,
    #[sea_orm(string_value = "course_exam")]
    CourseExam,
}

impl ExamType {
    pub fn as_str(&self) -> &'static str {
        match self {
            ExamType::Official => "official",
            ExamType::CustomPractice => "custom_practice",
            ExamType::CourseExam => "course_exam",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "difficulty_level")]
#[serde(rename_all = "snake_case")]
pub enum DifficultyLevel {
    #[sea_orm(string_value = "easy")]
    Easy,
    #[sea_orm(string_value = "medium")]
    Medium,
    #[sea_orm(string_value = "hard")]
    Hard,
}

impl DifficultyLevel {
    pub fn as_str(&self) -> &'static str {
        match self {
            DifficultyLevel::Easy => "easy",
            DifficultyLevel::Medium => "medium",
            DifficultyLevel::Hard => "hard",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "question_type")]
#[serde(rename_all = "snake_case")]
pub enum QuestionType {
    #[sea_orm(string_value = "multiple_choice")]
    MultipleChoice,
    #[sea_orm(string_value = "multiple_select")]
    MultipleSelect,
    #[sea_orm(string_value = "essay")]
    Essay,
    #[sea_orm(string_value = "statement_reasoning")]
    StatementReasoning,
}

impl QuestionType {
    pub fn as_str(&self) -> &'static str {
        match self {
            QuestionType::MultipleChoice => "multiple_choice",
            QuestionType::MultipleSelect => "multiple_select",
            QuestionType::Essay => "essay",
            QuestionType::StatementReasoning => "statement_reasoning",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "scoring_strategy")]
#[serde(rename_all = "snake_case")]
pub enum ScoringStrategy {
    #[sea_orm(string_value = "all_or_nothing")]
    AllOrNothing,
    #[sea_orm(string_value = "partial")]
    Partial,
    #[sea_orm(string_value = "partial_with_penalty")]
    PartialWithPenalty,
}

impl ScoringStrategy {
    pub fn as_str(&self) -> &'static str {
        match self {
            ScoringStrategy::AllOrNothing => "all_or_nothing",
            ScoringStrategy::Partial => "partial",
            ScoringStrategy::PartialWithPenalty => "partial_with_penalty",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "solution_type")]
#[serde(rename_all = "snake_case")]
pub enum SolutionType {
    #[sea_orm(string_value = "general")]
    General,
    #[sea_orm(string_value = "fast_method")]
    FastMethod,
    #[sea_orm(string_value = "video_link")]
    VideoLink,
    #[sea_orm(string_value = "tips")]
    Tips,
}

impl SolutionType {
    pub fn as_str(&self) -> &'static str {
        match self {
            SolutionType::General => "general",
            SolutionType::FastMethod => "fast_method",
            SolutionType::VideoLink => "video_link",
            SolutionType::Tips => "tips",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "exam_session_status")]
#[serde(rename_all = "snake_case")]
pub enum ExamSessionStatus {
    #[sea_orm(string_value = "in_progress")]
    InProgress,
    #[sea_orm(string_value = "completed")]
    Completed,
    #[sea_orm(string_value = "abandoned")]
    Abandoned,
}

impl ExamSessionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ExamSessionStatus::InProgress => "in_progress",
            ExamSessionStatus::Completed => "completed",
            ExamSessionStatus::Abandoned => "abandoned",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "exam_session_mode")]
#[serde(rename_all = "snake_case")]
pub enum ExamSessionMode {
    #[sea_orm(string_value = "study")]
    Study,
    #[sea_orm(string_value = "tryout")]
    Tryout,
}

impl ExamSessionMode {
    pub fn as_str(&self) -> &'static str {
        match self {
            ExamSessionMode::Study => "study",
            ExamSessionMode::Tryout => "tryout",
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "String", db_type = "Enum", enum_name = "exam_package_user_status")]
#[serde(rename_all = "snake_case")]
pub enum ExamPackageUserStatus {
    #[sea_orm(string_value = "not_started")]
    NotStarted,
    #[sea_orm(string_value = "in_progress")]
    InProgress,
    #[sea_orm(string_value = "completed")]
    Completed,
}

impl ExamPackageUserStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            ExamPackageUserStatus::NotStarted => "not_started",
            ExamPackageUserStatus::InProgress => "in_progress",
            ExamPackageUserStatus::Completed => "completed",
        }
    }
}
