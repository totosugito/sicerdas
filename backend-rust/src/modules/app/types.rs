use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLatestBody {
    pub db_version: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLatestVersion {
    pub id: i32,
    pub app_version: i32,
    pub db_version: i32,
    pub data_type: String,
    pub status: String,
    pub name: String,
    pub html_note: String,
    pub extra: Value,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLatestBook {
    pub id: Uuid,
    pub book_id: i32,
    pub version_id: Option<i32>,
    pub title: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub published_year: Option<String>,
    pub total_pages: Option<i32>,
    pub size: Option<i32>,
    pub status: String,
    pub book_group_id: Option<i32>,
    pub education_grade_id: Option<i32>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLatestGrade {
    pub id: i32,
    pub grade: String,
    pub name: String,
    pub desc: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLatestCategory {
    pub id: i32,
    pub name: String,
    pub key: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLatestGroup {
    pub id: i32,
    pub version_id: Option<i32>,
    pub category_id: Option<i32>,
    pub name: String,
    pub short_name: Option<String>,
    pub desc: Option<String>,
    pub status: String,
    pub book_total: i64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AppLatestData {
    pub versions: Vec<AppLatestVersion>,
    pub books: Vec<AppLatestBook>,
    pub grades: Vec<AppLatestGrade>,
    pub categories: Vec<AppLatestCategory>,
    pub groups: Vec<AppLatestGroup>,
    pub settings: Value,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BookInfoQuery {
    pub book_id: i32,
    pub page: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct BookInfoData {
    pub id: Uuid,
    pub book_id: i32,
    pub title: String,
    pub description: Option<String>,
    pub author: Option<String>,
    pub published_year: Option<String>,
    pub total_pages: Option<i32>,
    pub size: Option<i32>,
    pub status: String,
    pub pdf: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DictionaryPackage {
    pub pack_id: i32,
    pub pack_name: String,
    pub pack_release_date: String,
    pub pack_file_size: u64,
    pub pack_title: String,
    pub pack_source: String,
    pub pack_desc: String,
    pub pack_url: String,
    pub pack_word_info: Vec<String>,
    pub pack_sample_screen: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncElement {
    pub id: i32,
    pub idx: i32,
    pub idy: i32,
    pub atomic_number: i32,
    pub atomic_group: String,
    pub atomic_name: String,
    pub atomic_symbol: String,
    pub atomic_images: Value,
    pub atomic_properties: Value,
    pub atomic_isotope: Value,
    pub atomic_extra: Value,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct SyncNote {
    pub id: i32,
    pub atomic_number: i32,
    pub locale_code: String,
    pub atomic_overview: Option<String>,
    pub atomic_history: Option<String>,
    pub atomic_apps: Option<String>,
    pub atomic_facts: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PeriodicSyncData {
    pub elements: Vec<SyncElement>,
    pub notes: Vec<SyncNote>,
}
