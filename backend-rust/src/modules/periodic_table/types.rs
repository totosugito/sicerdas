use serde::Serialize;
use serde_json::Value;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct AtomicImages {
    pub atomic: String,
    pub safety: String,
    pub spectrum: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementNotes {
    pub locale_code: String,
    pub atomic_overview: String,
    pub atomic_history: String,
    pub atomic_apps: String,
    pub atomic_facts: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementNavItem {
    pub atomic_number: i32,
    pub atomic_name: String,
    pub atomic_group: String,
    pub atomic_symbol: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementNavigation {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub prev: Option<ElementNavItem>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub next: Option<ElementNavItem>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ElementData {
    pub id: i32,
    pub atomic_number: i32,
    pub atomic_group: String,
    pub atomic_name: String,
    pub atomic_symbol: String,
    pub atomic_properties: Value,
    pub atomic_isotope: Value,
    pub atomic_extra: Value,
    pub atomic_images: AtomicImages,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub notes: Option<ElementNotes>,
    pub navigation: ElementNavigation,
}
