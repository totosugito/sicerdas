use crate::types::response::PaginationMeta;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

// --- Shared ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamSimpleItem {
    pub value: Uuid,
    pub label: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamSimpleListData {
    pub items: Vec<ExamSimpleItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ExamTagRef {
    pub id: Uuid,
    pub name: String,
}

// --- Subjects ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectItem {
    pub id: Uuid,
    pub name: String,
    pub description: Option<String>,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectListData {
    pub items: Vec<SubjectItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectListBody {
    pub search: Option<String>,
    pub is_active: Option<bool>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectSimpleBody {
    pub search: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSubjectBody {
    pub name: String,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSubjectBody {
    pub name: Option<String>,
    pub description: Option<String>,
    pub is_active: Option<bool>,
}

// --- Passages ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PassageItem {
    pub id: Uuid,
    pub title: Option<String>,
    pub content: Value,
    pub is_active: bool,
    pub created_at: String,
    pub updated_at: String,
    pub subject_id: Uuid,
    pub total_questions: i32,
    pub active_questions: i32,
    pub subject_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PassageListData {
    pub items: Vec<PassageItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PassageListBody {
    pub search: Option<String>,
    pub is_active: Option<bool>,
    pub subject_id: Option<Uuid>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PassageSimpleBody {
    pub subject_id: Option<Uuid>,
    pub search: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePassageBody {
    pub title: Option<String>,
    pub content: Option<Value>,
    pub is_active: Option<bool>,
    pub subject_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePassageBody {
    pub title: Option<String>,
    pub content: Option<Value>,
    pub is_active: Option<bool>,
    pub subject_id: Option<Uuid>,
}

// --- Questions ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionResponseItem {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub passage_id: Option<Uuid>,
    pub content: Value,
    pub reason_content: Value,
    pub difficulty: String,
    pub r#type: String,
    pub max_score: i32,
    pub scoring_strategy: String,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: bool,
    pub variable_formulas: Option<Value>,
    pub created_at: String,
    pub updated_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subject_name: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionListItem {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub passage_id: Option<Uuid>,
    pub content: Value,
    pub difficulty: String,
    pub r#type: String,
    pub max_score: i32,
    pub scoring_strategy: String,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: bool,
    pub variable_formulas: Option<Value>,
    pub created_at: String,
    pub updated_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subject_name: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub education_grade_name: Option<String>,
    pub total_options: i64,
    pub tags: Vec<ExamTagRef>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionListData {
    pub items: Vec<QuestionListItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleQuestionItem {
    pub id: Uuid,
    pub subject_id: Uuid,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub subject_name: Option<String>,
    pub content: Value,
    pub difficulty: String,
    pub r#type: String,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleQuestionListData {
    pub items: Vec<SimpleQuestionItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionDetailOption {
    pub id: Uuid,
    pub content: Value,
    pub is_correct: bool,
    pub score: i32,
    pub order: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionDetailSolution {
    pub id: Uuid,
    pub title: String,
    pub content: Value,
    pub solution_type: String,
    pub order: i32,
    pub required_tier: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionDetailPassage {
    pub title: Option<String>,
    pub content: Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionDetailData {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub passage_id: Option<Uuid>,
    pub content: Value,
    pub difficulty: String,
    pub r#type: String,
    pub max_score: i32,
    pub scoring_strategy: String,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: bool,
    pub variable_formulas: Option<Value>,
    pub created_at: String,
    pub updated_at: String,
    pub subject_name: String,
    pub education_grade_name: Option<String>,
    pub reason_content: Value,
    pub options: Vec<QuestionDetailOption>,
    pub solutions: Vec<QuestionDetailSolution>,
    pub tags: Vec<ExamTagRef>,
    pub passage: Option<QuestionDetailPassage>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionListBody {
    pub search: Option<String>,
    pub subject_id: Option<Uuid>,
    pub difficulty: Option<String>,
    pub r#type: Option<String>,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: Option<bool>,
    pub scoring_strategy: Option<String>,
    pub exclude_package_id: Option<Uuid>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuestionBody {
    pub subject_id: Uuid,
    pub passage_id: Option<Uuid>,
    pub content: Option<Value>,
    pub reason_content: Option<Value>,
    pub difficulty: Option<String>,
    pub r#type: Option<String>,
    pub scoring_strategy: Option<String>,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: Option<bool>,
    pub variable_formulas: Option<Value>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateQuestionBody {
    pub subject_id: Option<Uuid>,
    pub passage_id: Option<Option<Uuid>>,
    pub content: Option<Value>,
    pub reason_content: Option<Value>,
    pub difficulty: Option<String>,
    pub r#type: Option<String>,
    pub scoring_strategy: Option<String>,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<Option<i32>>,
    pub is_active: Option<bool>,
    pub variable_formulas: Option<Option<Value>>,
}

// --- Question Options ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionOptionItem {
    pub id: Uuid,
    pub question_id: Uuid,
    pub content: Value,
    pub is_correct: bool,
    pub score: i32,
    pub order: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionOptionListData {
    pub items: Vec<QuestionOptionItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionOptionListBody {
    pub question_id: Option<Uuid>,
    pub is_correct: Option<bool>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuestionOptionBody {
    pub question_id: Uuid,
    pub content: Option<Value>,
    pub is_correct: Option<bool>,
    pub score: Option<i32>,
    pub order: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateQuestionOptionBody {
    pub question_id: Option<Uuid>,
    pub content: Option<Value>,
    pub is_correct: Option<bool>,
    pub score: Option<i32>,
    pub order: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DeleteMultipleIdsBody {
    pub ids: Vec<Uuid>,
}

// --- Question Solutions ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionSolutionItem {
    pub id: Uuid,
    pub question_id: Uuid,
    pub title: String,
    pub content: Value,
    pub solution_type: String,
    pub order: i32,
    pub required_tier: Option<String>,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionSolutionListData {
    pub items: Vec<QuestionSolutionItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionSolutionListBody {
    pub question_id: Option<Uuid>,
    pub solution_type: Option<String>,
    pub required_tier: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateQuestionSolutionBody {
    pub question_id: Uuid,
    pub title: String,
    pub content: Option<Value>,
    pub solution_type: String,
    pub order: Option<i32>,
    pub required_tier: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateQuestionSolutionBody {
    pub question_id: Option<Uuid>,
    pub title: Option<String>,
    pub content: Option<Value>,
    pub solution_type: Option<String>,
    pub order: Option<i32>,
    pub required_tier: Option<String>,
}

// --- Question Tags ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionTagItem {
    pub question_id: Uuid,
    pub tag_id: Uuid,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub tag: Option<ExamTagRef>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct QuestionTagListBody {
    pub question_id: Option<Uuid>,
    pub tag_id: Option<Uuid>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssignQuestionTagsBody {
    pub question_id: Uuid,
    pub tag_ids: Vec<Uuid>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssignQuestionTagsByNameBody {
    pub question_id: Uuid,
    pub tags: Vec<String>,
}


// --- Packages ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageCategoryRef {
    pub id: Uuid,
    pub name: String,
    pub key: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageGradeRef {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageStatsInfo {
    pub view_count: i32,
    pub like_count: i32,
    pub bookmark_count: i32,
    pub rating_count: i32,
    pub rating: f64,
    pub active_sections: i32,
    pub active_questions: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageUserInteraction {
    pub liked: bool,
    pub disliked: bool,
    pub rating: f64,
    pub bookmarked: bool,
    pub status: String,
    pub completed_sections_count: i32,
    pub view_count: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicPackageItem {
    pub id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub exam_type: String,
    pub duration_minutes: i32,
    pub thumbnail: Option<String>,
    pub required_tier: String,
    pub is_active: bool,
    pub parent_package_id: Option<Uuid>,
    pub is_new: bool,
    pub created_at: String,
    pub updated_at: String,
    pub category: PackageCategoryRef,
    pub grade: Option<PackageGradeRef>,
    pub stats: PackageStatsInfo,
    pub user_interaction: Option<PackageUserInteraction>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicPackageListData {
    pub items: Vec<PublicPackageItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicPackageListBody {
    pub category_id: Option<Uuid>,
    pub category_key: Option<String>,
    pub education_grade_ids: Option<Vec<i32>>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminPackageItem {
    pub id: Uuid,
    pub category_id: Uuid,
    pub title: String,
    pub exam_type: String,
    pub duration_minutes: i32,
    pub description: Option<String>,
    pub required_tier: String,
    pub education_grade_id: Option<i32>,
    pub is_active: bool,
    pub version_id: Option<i32>,
    pub thumbnail: Option<String>,
    pub parent_package_id: Option<Uuid>,
    pub total_sections: i32,
    pub active_sections: i32,
    pub total_questions: i32,
    pub active_questions: i32,
    pub is_new: bool,
    pub created_at: String,
    pub updated_at: String,
    pub category: Option<PackageCategoryRef>,
    pub grade: Option<PackageGradeRef>,
    pub stats: PackageStatsInfo,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminPackageListData {
    pub items: Vec<AdminPackageItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminPackageListBody {
    pub search: Option<String>,
    pub category_id: Option<Uuid>,
    pub category_key: Option<String>,
    pub exam_type: Option<Vec<String>>,
    pub is_active: Option<bool>,
    pub education_grade_id: Option<i32>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageSimpleBody {
    pub search: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub exam_type: Option<Vec<String>>,
    pub category_id: Option<Uuid>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePackageBody {
    pub category_id: Uuid,
    pub title: String,
    pub exam_type: Option<String>,
    pub description: Option<String>,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: Option<bool>,
    pub version_id: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdatePackageBody {
    pub category_id: Option<Uuid>,
    pub title: Option<String>,
    pub exam_type: Option<String>,
    pub description: Option<String>,
    pub required_tier: Option<String>,
    pub education_grade_id: Option<i32>,
    pub is_active: Option<bool>,
    pub version_id: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ClonePackageBody {
    pub source_package_id: Uuid,
    pub title: Option<String>,
    pub exam_type: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClonePackageData {
    pub id: Uuid,
    pub parent_package_id: Option<Uuid>,
    pub title: String,
    pub exam_type: String,
    pub total_sections: i32,
    pub total_questions: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailQuery {
    pub action: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailData {
    pub id: Uuid,
    pub thumbnail: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookmarkBody {
    pub package_id: Uuid,
    pub bookmarked: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookmarkData {
    pub bookmarked: bool,
    pub bookmark_count: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RatingBody {
    pub package_id: Uuid,
    pub rating: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RatingUserInteraction {
    pub rating: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RatingData {
    pub rating: f64,
    pub rating_count: i32,
    pub user_interaction: RatingUserInteraction,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoritesBody {
    pub page: Option<u64>,
    pub page_size: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoritePackageCategory {
    pub name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoritePackageStats {
    pub rating: f64,
    pub active_questions: i32,
    pub active_sections: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoritePackageInteraction {
    pub status: String,
    pub completed_sections_count: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoritePackageItem {
    pub id: Uuid,
    pub title: String,
    pub category: FavoritePackageCategory,
    pub thumbnail: Option<String>,
    pub stats: FavoritePackageStats,
    pub user_interaction: FavoritePackageInteraction,
    pub bookmarked_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateCustomBody {
    pub category_id: Uuid,
    pub education_grade_id: i32,
    pub tag_ids: Vec<Uuid>,
    pub limit: Option<i64>,
    pub package_title: Option<String>,
    pub section_title: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GenerateCustomData {
    pub package_id: Uuid,
    pub section_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListCustomBody {
    pub page: Option<u64>,
    pub page_size: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomPackageStats {
    pub active_questions: i32,
    pub active_sections: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CustomPackageItem {
    pub id: Uuid,
    pub title: String,
    pub thumbnail: Option<String>,
    pub duration_minutes: i32,
    pub stats: CustomPackageStats,
    pub category: FavoritePackageCategory,
    pub grade: FavoritePackageCategory,
    pub user_interaction: FavoritePackageInteraction,
    pub created_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamGradeStats {
    pub active_count: i32,
    pub total_count: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamGrade {
    pub id: i32,
    pub name: String,
    pub stats: FilterParamGradeStats,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamCategory {
    pub id: Uuid,
    pub name: String,
    pub key: String,
    pub description: Option<String>,
    pub grades: Vec<FilterParamGrade>,
}

// --- Package Sections ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ListSectionBody {
    pub package_id: Uuid,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicSectionItem {
    pub id: Uuid,
    pub title: String,
    pub group_name: Option<String>,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub total_questions: i32,
    pub active_questions: i32,
    pub order: i32,
    pub user_status: Option<String>,
    pub user_mode: Option<String>,
    pub best_tryout_score: Option<f64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminSectionListBody {
    pub search: Option<String>,
    pub package_id: Option<Uuid>,
    pub exam_type: Option<Vec<String>>,
    pub is_active: Option<bool>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminSectionItem {
    pub id: Uuid,
    pub package_id: Uuid,
    pub title: String,
    pub group_name: Option<String>,
    pub description: Option<String>,
    pub duration_minutes: i32,
    pub order: i32,
    pub is_active: bool,
    pub version_id: Option<i32>,
    pub question_limit: i32,
    pub is_random_item: bool,
    pub is_random_choice: bool,
    pub total_questions: i32,
    pub active_questions: i32,
    pub max_score: f64,
    pub package_name: Option<String>,
    pub parent_package_id: Option<Uuid>,
    pub is_new: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminSectionPackageHeader {
    pub package_id: String,
    pub package_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminSectionListData {
    pub package: AdminSectionPackageHeader,
    pub items: Vec<AdminSectionItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SectionSimpleBody {
    pub search: Option<String>,
    pub package_id: Option<Uuid>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CreateSectionBody {
    pub package_id: Uuid,
    pub title: String,
    pub group_name: Option<String>,
    pub description: Option<String>,
    pub duration_minutes: Option<i32>,
    pub order: Option<i32>,
    pub is_active: Option<bool>,
    pub version_id: Option<i32>,
    pub question_limit: Option<i32>,
    pub is_random_item: Option<bool>,
    pub is_random_choice: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateSectionBody {
    pub package_id: Option<Uuid>,
    pub title: Option<String>,
    pub group_name: Option<String>,
    pub description: Option<String>,
    pub duration_minutes: Option<i32>,
    pub order: Option<i32>,
    pub is_active: Option<bool>,
    pub version_id: Option<i32>,
    pub question_limit: Option<i32>,
    pub is_random_item: Option<bool>,
    pub is_random_choice: Option<bool>,
}

// --- Package Questions ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageQuestionListBody {
    pub package_id: Uuid,
    pub section_id: Option<Uuid>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageQuestionRef {
    pub id: Uuid,
    pub content: Value,
    pub r#type: String,
    pub difficulty: String,
    pub subject_name: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageQuestionSectionRef {
    pub id: Uuid,
    pub title: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageQuestionItem {
    pub package_id: Uuid,
    pub section_id: Uuid,
    pub question_id: Uuid,
    pub order: i32,
    pub question: PackageQuestionRef,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub section: Option<PackageQuestionSectionRef>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PackageQuestionListData {
    pub items: Vec<PackageQuestionItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AssignPackageQuestionsBody {
    pub package_id: Uuid,
    pub section_id: Uuid,
    pub question_ids: Vec<Uuid>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AssignPackageQuestionsData {
    pub total_assigned: usize,
    pub total_skipped: usize,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UnassignPackageQuestionsBody {
    pub package_id: Uuid,
    pub question_ids: Vec<Uuid>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncOrderUpdateItem {
    pub question_id: Uuid,
    pub order: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncPackageQuestionsOrderBody {
    pub package_id: Uuid,
    pub section_id: Uuid,
    pub updates: Vec<SyncOrderUpdateItem>,
}


// --- Sessions ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct StartSessionBody {
    pub package_id: Uuid,
    pub section_id: Uuid,
    pub mode: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StartSessionData {
    pub session_id: Uuid,
    pub is_resumed: bool,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveAnswerBody {
    pub session_id: Uuid,
    pub question_id: Uuid,
    pub selected_option_id: Option<Uuid>,
    pub text_answer: Option<Vec<Value>>,
    pub is_doubtful: Option<bool>,
    pub elapsed_seconds: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SaveAnswerData {
    pub session_id: Uuid,
    pub question_id: Uuid,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionHistoryBody {
    pub package_id: Uuid,
    pub section_id: Uuid,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AllSessionsBody {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub status: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionGridItem {
    pub question_id: Uuid,
    pub order: i32,
    pub is_answered: bool,
    pub is_doubtful: bool,
    pub is_correct: Option<bool>,
    pub question_content: Option<Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionDetailsSession {
    pub id: Uuid,
    pub package_id: Uuid,
    pub status: String,
    pub mode: String,
    pub elapsed_seconds: i32,
    pub is_timer_active: bool,
    pub score: Option<f64>,
    pub earned_points: Option<f64>,
    pub max_points: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionDetailsGrade {
    pub name: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionDetailsPackage {
    pub id: Uuid,
    pub title: String,
    pub grade: SessionDetailsGrade,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionDetailsSection {
    pub title: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionDetailsData {
    pub session: SessionDetailsSession,
    pub package: SessionDetailsPackage,
    pub section: SessionDetailsSection,
    pub grid: Vec<SessionGridItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionQuestionInfo {
    pub id: Uuid,
    pub r#type: String,
    pub html_content: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionPassageInfo {
    pub id: Uuid,
    pub title: Option<String>,
    pub html_content: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionOptionInfo {
    pub id: Uuid,
    pub html_content: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionSolutionInfo {
    pub id: Uuid,
    pub title: String,
    pub html_content: String,
    pub solution_type: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionEvaluationInfo {
    pub is_correct: Option<bool>,
    pub correct_option_id: Option<Uuid>,
    pub solutions: Vec<SessionSolutionInfo>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionQuestionData {
    pub question: SessionQuestionInfo,
    pub passage: Option<SessionPassageInfo>,
    pub options: Vec<SessionOptionInfo>,
    pub evaluation: Option<SessionEvaluationInfo>,
    pub selected_option_id: Option<Uuid>,
    pub text_answer: Option<Value>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubmitSessionData {
    pub score: f64,
    pub earned_points: f64,
    pub max_points: f64,
    pub total_correct: i32,
    pub total_wrong: i32,
    pub total_skipped: i32,
    pub total_questions: usize,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionHistoryItem {
    pub id: Uuid,
    pub start_time: String,
    pub end_time: Option<String>,
    pub status: String,
    pub mode: String,
    pub score: Option<f64>,
    pub total_correct: i32,
    pub total_wrong: i32,
    pub total_skipped: i32,
    pub earned_points: Option<f64>,
    pub max_points: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SessionHistoryListData {
    pub items: Vec<SessionHistoryItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AllSessionHistoryItem {
    pub id: Uuid,
    pub start_time: String,
    pub end_time: Option<String>,
    pub status: String,
    pub mode: String,
    pub score: Option<f64>,
    pub total_correct: i32,
    pub total_wrong: i32,
    pub total_skipped: i32,
    pub package_title: String,
    pub section_title: String,
    pub package_id: Uuid,
    pub earned_points: Option<f64>,
    pub max_points: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AllSessionHistoryListData {
    pub items: Vec<AllSessionHistoryItem>,
    pub meta: PaginationMeta,
}

// --- Leaderboard ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LeaderboardBody {
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LeaderboardItem {
    pub rank: usize,
    pub user_id: Uuid,
    pub name: Option<String>,
    pub average_score: String,
    pub total_exams_taken: i32,
}

// --- User Stats ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalStatsItem {
    pub user_id: Uuid,
    pub total_exams_taken: i32,
    pub total_questions_answered: i32,
    pub total_correct_answers: i32,
    pub total_wrong_answers: i32,
    pub average_score: String,
    pub accuracy_rate: String,
    pub last_active_at: Option<String>,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectStatsBody {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub sort_by: Option<String>,
    pub order: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectStatsItem {
    pub id: Uuid,
    pub subject_id: Uuid,
    pub subject_name: String,
    pub total_questions_answered: i32,
    pub total_correct: i32,
    pub total_wrong: i32,
    pub accuracy_rate: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SubjectStatsListData {
    pub items: Vec<SubjectStatsItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TagStatsQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub sort_by: Option<String>,
    pub order: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TagStatsItem {
    pub id: Uuid,
    pub tag_id: Uuid,
    pub tag_name: String,
    pub total_questions_answered: i32,
    pub total_correct: i32,
    pub total_wrong: i32,
    pub accuracy_rate: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct TagStatsListData {
    pub items: Vec<TagStatsItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityQuery {
    pub days: Option<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ActivityItem {
    pub date: String,
    pub total_questions: i32,
    pub total_correct: i32,
    pub total_wrong: i32,
    pub total_sessions: i32,
}
