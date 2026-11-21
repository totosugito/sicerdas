use crate::types::response::PaginationMeta;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

// --- Shared Refs ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseCategoryRef {
    pub id: Uuid,
    pub name: String,
    pub key: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseGradeRef {
    pub id: i32,
    pub name: String,
    pub grade: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseProgressSummary {
    pub enrollment_status: String,
    pub completed_lectures: i64,
    pub progress_percentage: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseItem {
    pub id: Uuid,
    pub created_by_user_id: Option<Uuid>,
    pub course_code: String,
    pub course_name: String,
    pub course_description: Option<String>,
    pub what_you_will_learn: Option<String>,
    pub price: i32,
    pub thumbnail: Option<String>,
    pub category_id: Uuid,
    pub education_grade_id: Option<i32>,
    pub tags: Option<Vec<String>>,
    pub instructions: Option<String>,
    pub status: String,
    pub publish_date_type: String,
    pub publish_date_start: Option<String>,
    pub publish_date_end: Option<String>,
    pub is_public: bool,
    pub is_sequential: bool,
    pub version_id: Option<i32>,
    pub extra: Value,
    pub created_at: String,
    pub updated_at: String,
    pub category: Option<CourseCategoryRef>,
    pub grade: Option<CourseGradeRef>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_chapters: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_lectures: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub enrolled_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_ratings: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub average_rating: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub progress: Option<CourseProgressSummary>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseUserDetailProgress {
    pub enrollment_status: String,
    pub completed_lectures: i64,
    pub progress_percentage: i64,
    pub rating: Option<f64>,
    pub bookmarked: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseUserDetail {
    pub id: Uuid,
    pub course_code: String,
    pub course_name: String,
    pub course_description: Option<String>,
    pub what_you_will_learn: Option<String>,
    pub price: i32,
    pub thumbnail: Option<String>,
    pub category: Option<CourseCategoryRef>,
    pub grade: Option<CourseGradeRef>,
    pub total_chapters: i32,
    pub total_lectures: i32,
    pub enrolled_count: i32,
    pub total_ratings: i32,
    pub average_rating: f64,
    pub progress: Option<CourseUserDetailProgress>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCreateCourseBody {
    pub course_code: String,
    pub course_name: String,
    pub category_id: Uuid,
    pub education_grade_id: i32,
    pub course_description: Option<String>,
    pub what_you_will_learn: Option<String>,
    pub price: Option<i32>,
    pub tags: Option<Vec<String>>,
    pub instructions: Option<String>,
    pub status: Option<String>,
    pub publish_date_type: Option<String>,
    pub publish_date_start: Option<String>,
    pub publish_date_end: Option<String>,
    pub is_public: Option<bool>,
    pub is_sequential: Option<bool>,
    pub version_id: i32,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUpdateCourseBody {
    pub course_code: Option<String>,
    pub course_name: Option<String>,
    pub category_id: Option<Uuid>,
    pub education_grade_id: Option<i32>,
    pub course_description: Option<String>,
    pub what_you_will_learn: Option<String>,
    pub price: Option<i32>,
    pub thumbnail: Option<String>,
    pub tags: Option<Vec<String>>,
    pub instructions: Option<String>,
    pub status: Option<String>,
    pub publish_date_type: Option<String>,
    pub publish_date_start: Option<String>,
    pub publish_date_end: Option<String>,
    pub is_public: Option<bool>,
    pub is_sequential: Option<bool>,
    pub version_id: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseListQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
    pub search: Option<String>,
    pub category_id: Option<Uuid>,
    pub category_key: Option<String>,
    pub education_grade_id: Option<i32>,
    pub education_grade_ids: Option<Vec<i32>>,
    pub status: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub version_id: Option<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseListData {
    pub items: Vec<CourseItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailQuery {
    pub action: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ThumbnailResponseData {
    pub id: Uuid,
    pub thumbnail: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamsGradeStats {
    pub active_count: i64,
    pub total_count: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamsGrade {
    pub id: i32,
    pub name: String,
    pub stats: FilterParamsGradeStats,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamsCategoryItem {
    pub id: Uuid,
    pub name: String,
    pub key: String,
    pub description: Option<String>,
    pub grades: Vec<FilterParamsGrade>,
}

// --- Chapters & Lectures ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChapterItem {
    pub id: Uuid,
    pub chapter_name: Option<String>,
    pub course_id: Uuid,
    pub created_by_user_id: Option<Uuid>,
    pub extra: Value,
    pub is_active: bool,
    pub position: Option<String>,
    pub created_at: String,
    pub updated_at: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub total_lectures: Option<i32>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCreateChapterBody {
    pub course_id: Uuid,
    pub chapter_name: String,
    pub position: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUpdateChapterBody {
    pub chapter_name: Option<String>,
    pub position: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ReorderItem {
    pub id: Uuid,
    pub position: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminReorderBody {
    pub items: Vec<ReorderItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LectureItem {
    pub id: Uuid,
    pub title: Option<String>,
    pub description: Option<String>,
    pub chapter_id: Uuid,
    pub created_by_user_id: Option<Uuid>,
    pub r#type: String,
    pub reference_url: Option<String>,
    pub extra: Value,
    pub is_active: bool,
    pub position: String,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCreateLectureBody {
    pub chapter_id: Uuid,
    pub title: String,
    pub description: Option<String>,
    pub r#type: Option<String>,
    pub reference_url: Option<String>,
    pub extra: Option<Value>,
    pub position: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUpdateLectureBody {
    pub title: Option<String>,
    pub description: Option<String>,
    pub r#type: Option<String>,
    pub reference_url: Option<String>,
    pub extra: Option<Value>,
    pub position: Option<String>,
    pub is_active: Option<bool>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCourseStructureChapter {
    pub id: Uuid,
    pub chapter_name: Option<String>,
    pub course_id: Uuid,
    pub created_by_user_id: Option<Uuid>,
    pub extra: Value,
    pub is_active: bool,
    pub position: String,
    pub total_lectures: i32,
    pub active_lectures: i32,
    pub created_at: String,
    pub updated_at: String,
    pub lectures: Vec<LectureItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicCourseStructureLecture {
    pub id: Uuid,
    pub title: Option<String>,
    pub description: Option<String>,
    pub chapter_id: Uuid,
    pub r#type: String,
    pub position: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PublicCourseStructureChapter {
    pub id: Uuid,
    pub chapter_name: Option<String>,
    pub course_id: Uuid,
    pub position: Option<String>,
    pub lectures: Vec<PublicCourseStructureLecture>,
}

// --- User Course Interactions ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseRatingBody {
    pub rating: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CourseInteractionData {
    pub course_id: Uuid,
    pub user_id: Uuid,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rating: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bookmarked: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub liked: Option<bool>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub disliked: Option<bool>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoritesQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoriteCourseItem {
    pub id: Uuid,
    pub course_code: String,
    pub course_name: String,
    pub course_description: Option<String>,
    pub thumbnail: Option<String>,
    pub price: i32,
    pub bookmarked: bool,
    pub liked: bool,
    pub rating: Option<f64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoriteCourseListData {
    pub items: Vec<FavoriteCourseItem>,
    pub meta: PaginationMeta,
}

// --- Lecture Texts ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LectureTextItem {
    pub id: Uuid,
    pub title: Option<String>,
    pub content: Value,
    pub category_id: Option<Uuid>,
    pub education_grade_id: Option<i32>,
    pub status: String,
    pub created_by_user_id: Option<Uuid>,
    pub created_at: String,
    pub updated_at: String,
    pub category: Option<CourseCategoryRef>,
    pub grade: Option<CourseGradeRef>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminCreateLectureTextBody {
    pub title: Option<String>,
    pub content: Option<Value>,
    pub category_id: Option<Uuid>,
    pub education_grade_id: Option<i32>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AdminUpdateLectureTextBody {
    pub title: Option<String>,
    pub content: Option<Value>,
    pub category_id: Option<Option<Uuid>>,
    pub education_grade_id: Option<Option<i32>>,
    pub status: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LectureTextListQuery {
    pub search: Option<String>,
    pub category_id: Option<Uuid>,
    pub education_grade_id: Option<i32>,
    pub status: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LectureTextListData {
    pub items: Vec<LectureTextItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LectureTextSimpleQuery {
    pub search: Option<String>,
    pub category_id: Option<Uuid>,
    pub education_grade_id: Option<i32>,
    pub status: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SimpleLectureTextItem {
    pub value: Uuid,
    pub label: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LectureTextSimpleListData {
    pub items: Vec<SimpleLectureTextItem>,
    pub meta: PaginationMeta,
}

// --- Enrollments ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct EnrollmentItem {
    pub id: Uuid,
    pub course_id: Uuid,
    pub user_id: Uuid,
    pub status: String,
    pub enrolled_at: String,
    pub completed_at: Option<String>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct UserCourseListQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserCourseCourseRef {
    pub id: Uuid,
    pub course_code: String,
    pub course_name: String,
    pub course_description: Option<String>,
    pub thumbnail: Option<String>,
    pub price: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserCourseItem {
    pub enrollment_id: Uuid,
    pub status: String,
    pub enrolled_at: String,
    pub completed_at: Option<String>,
    pub course: UserCourseCourseRef,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserCoursePaginatedResponse {
    pub success: bool,
    pub message: String,
    pub data: Vec<UserCourseItem>,
    pub pagination: PaginationMeta,
}

// --- User Progress ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct LectureProgressItem {
    pub id: Uuid,
    pub title: Option<String>,
    pub description: Option<String>,
    pub chapter_id: Uuid,
    pub r#type: String,
    pub reference_url: Option<String>,
    pub extra: Value,
    pub package_id: Option<Uuid>,
    pub position: String,
    pub is_completed: bool,
    pub watch_time_seconds: i32,
    pub completed_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ChapterProgressItem {
    pub id: Uuid,
    pub chapter_name: Option<String>,
    pub course_id: Uuid,
    pub position: String,
    pub lectures: Vec<LectureProgressItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SyllabusData {
    pub course_id: Uuid,
    pub total_lectures: usize,
    pub completed_lectures: usize,
    pub progress_percentage: i64,
    pub chapters: Vec<ChapterProgressItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CompleteLectureData {
    pub lecture_id: Uuid,
    pub course_id: Uuid,
    pub is_completed: bool,
    pub completed_at: String,
    pub score: Option<f64>,
    pub passed: bool,
}

// --- User Stats ---

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GlobalStatsData {
    pub user_id: Uuid,
    pub total_courses_enrolled: i32,
    pub total_courses_completed: i32,
    pub total_lectures_completed: i32,
    pub total_watch_time_minutes: f64,
    pub last_active_at: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CategoryStatItem {
    pub category_id: Uuid,
    pub category_name: String,
    pub courses_enrolled: i32,
    pub courses_completed: i32,
}
