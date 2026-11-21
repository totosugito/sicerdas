use crate::types::response::PaginationMeta;
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookCover {
    pub xs: String,
    pub lg: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookCategoryRef {
    pub id: i32,
    pub name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookGroupRef {
    pub id: i32,
    pub name: String,
    pub short_name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookGradeRef {
    pub id: i32,
    pub name: String,
    pub grade: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookUserInteraction {
    pub liked: bool,
    pub disliked: bool,
    pub rating: f64,
    pub bookmarked: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookDetailUserInteraction {
    pub liked: bool,
    pub disliked: bool,
    pub rating: f64,
    pub bookmarked: bool,
    pub view_count: i32,
    pub download_count: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookListItem {
    pub id: Uuid,
    pub book_id: i32,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    pub published_year: String,
    pub total_pages: i32,
    pub size: i32,
    pub status: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub rating: Option<f64>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub view_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub download_count: Option<i32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub bookmark_count: Option<i32>,
    pub cover: BookCover,
    pub category: BookCategoryRef,
    pub group: BookGroupRef,
    pub grade: BookGradeRef,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_interaction: Option<BookUserInteraction>,
    pub is_new: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookListData {
    pub items: Vec<BookListItem>,
    pub meta: PaginationMeta,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookDetailData {
    pub id: Uuid,
    pub book_id: i32,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    pub published_year: String,
    pub total_pages: i32,
    pub size: i32,
    pub status: String,
    pub rating: f64,
    pub view_count: i32,
    pub download_count: i32,
    pub bookmark_count: i32,
    pub rating_count: i32,
    pub cover: BookCover,
    pub pdf: String,
    pub samples: BookCover,
    pub category: BookCategoryRef,
    pub group: BookGroupRef,
    pub grade: BookGradeRef,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user_interaction: Option<BookDetailUserInteraction>,
    pub is_new: bool,
    pub created_at: String,
    pub updated_at: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookListBody {
    pub category: Option<Vec<i32>>,
    pub group: Option<Vec<i32>>,
    pub grade: Option<Vec<i32>>,
    pub search: Option<String>,
    pub sort_by: Option<String>,
    pub sort_order: Option<String>,
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamsGroupStats {
    pub book_total: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamsGroupItem {
    pub id: i32,
    pub name: String,
    pub short_name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub desc: Option<String>,
    pub status: String,
    pub stats: FilterParamsGroupStats,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FilterParamsItem {
    pub id: i32,
    pub code: String,
    pub name: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub desc: Option<String>,
    pub status: String,
    pub groups: Vec<FilterParamsGroupItem>,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookmarkBody {
    pub book_id: i32,
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
    pub book_id: i32,
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
pub struct DownloadBody {
    pub id: Option<Uuid>,
    pub book_id: Option<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DownloadData {
    pub download_count: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UserBookStatsData {
    pub total_favorites: i64,
    pub total_materials_read: i64,
    pub total_downloads: i64,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookPaginationQuery {
    pub page: Option<u64>,
    pub limit: Option<u64>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookSimpleCategoryRef {
    pub name: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryBookStats {
    pub rating: f64,
    pub bookmark_count: i32,
    pub view_count: i32,
    pub download_count: i32,
    pub is_downloaded: bool,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct HistoryBookItem {
    pub id: Uuid,
    pub book_id: i32,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    pub cover: BookCover,
    pub category: BookSimpleCategoryRef,
    pub grade: BookGradeRef,
    pub stats: HistoryBookStats,
    pub viewed_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FavoriteBookItem {
    pub id: Uuid,
    pub book_id: i32,
    pub title: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub author: Option<String>,
    pub cover: BookCover,
    pub category: BookSimpleCategoryRef,
    pub grade: BookGradeRef,
    pub stats: HistoryBookStats,
    pub bookmarked_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GroupStatsItem {
    pub group_id: i32,
    pub book_total: i32,
    pub updated_at: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PaginatedListResponse<T: Serialize> {
    pub success: bool,
    pub message: String,
    pub data: Vec<T>,
    pub pagination: PaginationMeta,
}
