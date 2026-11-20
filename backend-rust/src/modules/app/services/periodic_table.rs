use crate::app::AppState;
use crate::error::AppError;
use crate::modules::app::types::{PeriodicSyncData, SyncElement, SyncNote};
use sea_orm::{ConnectionTrait, DbBackend, Statement};
use serde_json::{json, Value};

const CACHE_KEY_PERIODIC_SYNC: &str = "app:periodic-table";

pub async fn get_periodic_sync_data(state: &AppState) -> Result<PeriodicSyncData, AppError> {
    if let Some(cached) = state.read_cache.get(CACHE_KEY_PERIODIC_SYNC).await {
        if let Ok(data) = serde_json::from_value::<PeriodicSyncData>(cached) {
            return Ok(data);
        }
    }

    let el_rows = state
        .db
        .query_all(Statement::from_string(
            DbBackend::Postgres,
            "SELECT id, idx, idy, atomic_number, atomic_group::text AS atomic_group, atomic_name, atomic_symbol, atomic_images, atomic_properties, atomic_isotope, atomic_extra FROM periodic_elements",
        ))
        .await?;

    let elements: Vec<SyncElement> = el_rows
        .into_iter()
        .map(|r| -> Result<SyncElement, AppError> {
            Ok(SyncElement {
                id: r.try_get("", "id")?,
                idx: r.try_get("", "idx")?,
                idy: r.try_get("", "idy")?,
                atomic_number: r.try_get("", "atomic_number")?,
                atomic_group: r.try_get("", "atomic_group")?,
                atomic_name: r.try_get("", "atomic_name")?,
                atomic_symbol: r.try_get("", "atomic_symbol")?,
                atomic_images: r
                    .try_get::<Option<Value>>("", "atomic_images")?
                    .unwrap_or_else(|| json!({})),
                atomic_properties: r
                    .try_get::<Option<Value>>("", "atomic_properties")?
                    .unwrap_or_else(|| json!({})),
                atomic_isotope: r
                    .try_get::<Option<Value>>("", "atomic_isotope")?
                    .unwrap_or_else(|| json!({})),
                atomic_extra: r
                    .try_get::<Option<Value>>("", "atomic_extra")?
                    .unwrap_or_else(|| json!({})),
            })
        })
        .collect::<Result<Vec<_>, _>>()?;

    let note_rows = state
        .db
        .query_all(Statement::from_string(
            DbBackend::Postgres,
            "SELECT id, atomic_number, locale_code, atomic_overview, atomic_history, atomic_apps, atomic_facts FROM periodic_element_notes",
        ))
        .await?;

    let notes: Vec<SyncNote> = note_rows
        .into_iter()
        .map(|r| -> Result<SyncNote, AppError> {
            Ok(SyncNote {
                id: r.try_get("", "id")?,
                atomic_number: r.try_get("", "atomic_number")?,
                locale_code: r.try_get("", "locale_code")?,
                atomic_overview: r.try_get("", "atomic_overview")?,
                atomic_history: r.try_get("", "atomic_history")?,
                atomic_apps: r.try_get("", "atomic_apps")?,
                atomic_facts: r.try_get("", "atomic_facts")?,
            })
        })
        .collect::<Result<Vec<_>, _>>()?;

    let data = PeriodicSyncData { elements, notes };
    if let Ok(val) = serde_json::to_value(&data) {
        state
            .read_cache
            .insert(CACHE_KEY_PERIODIC_SYNC.to_string(), val)
            .await;
    }
    Ok(data)
}
