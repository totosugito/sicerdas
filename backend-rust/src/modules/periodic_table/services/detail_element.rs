use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::periodic_table::types::{
    AtomicImages, ElementData, ElementNavItem, ElementNavigation, ElementNotes,
};
use sea_orm::{ConnectionTrait, DbBackend, Statement};
use serde_json::{json, Value};

fn resolve_atomic_images(public_url: &str, raw: Option<Value>) -> AtomicImages {
    let base = public_url.trim_end_matches('/');
    let obj = raw.unwrap_or_else(|| json!({}));
    let make = |folder: &str, key: &str| {
        obj.get(key)
            .and_then(|v| v.as_str())
            .filter(|s| !s.is_empty())
            .map(|f| format!("{base}/table-periodic/images/{folder}/{f}"))
            .unwrap_or_default()
    };
    AtomicImages {
        atomic: make("atomic", "atomic"),
        safety: make("safety", "safety"),
        spectrum: make("spectrum", "spectrum"),
    }
}

async fn fetch_nav(state: &AppState, atomic_number: i32) -> Result<Option<ElementNavItem>, AppError> {
    let row = state
        .db
        .query_one(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "SELECT atomic_number, atomic_name, atomic_group::text AS atomic_group, atomic_symbol FROM periodic_elements WHERE atomic_number = $1 LIMIT 1",
            [atomic_number.into()],
        ))
        .await?;

    match row {
        Some(r) => Ok(Some(ElementNavItem {
            atomic_number: r.try_get("", "atomic_number")?,
            atomic_name: r.try_get("", "atomic_name")?,
            atomic_group: r.try_get("", "atomic_group")?,
            atomic_symbol: r.try_get("", "atomic_symbol")?,
        })),
        None => Ok(None),
    }
}

pub async fn get_element_detail(
    state: &AppState,
    atomic_number: i32,
    locale_code: &str,
    locale: RequestLocale,
) -> Result<ElementData, AppError> {
    let row = state
        .db
        .query_one(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "SELECT pe.id, pe.atomic_number, pe.atomic_group::text AS atomic_group, pe.atomic_name, pe.atomic_symbol, pe.atomic_properties, pe.atomic_isotope, pe.atomic_extra, pe.atomic_images, pen.locale_code, pen.atomic_overview, pen.atomic_history, pen.atomic_apps, pen.atomic_facts FROM periodic_elements pe LEFT JOIN periodic_element_notes pen ON pe.atomic_number = pen.atomic_number AND pen.locale_code = $2 WHERE pe.atomic_number = $1 LIMIT 1",
            [atomic_number.into(), locale_code.into()],
        ))
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::PeriodicElementNotFound)))?;

    let num: i32 = row.try_get("", "atomic_number")?;
    let prev = if num > 1 && num <= 118 {
        fetch_nav(state, num - 1).await?
    } else {
        None
    };
    let next = if num >= 1 && num < 118 {
        fetch_nav(state, num + 1).await?
    } else {
        None
    };

    let note_locale: Option<String> = row.try_get("", "locale_code")?;
    let notes = note_locale.map(|lc| ElementNotes {
        locale_code: lc,
        atomic_overview: row
            .try_get::<Option<String>>("", "atomic_overview")
            .ok()
            .flatten()
            .unwrap_or_default(),
        atomic_history: row
            .try_get::<Option<String>>("", "atomic_history")
            .ok()
            .flatten()
            .unwrap_or_default(),
        atomic_apps: row
            .try_get::<Option<String>>("", "atomic_apps")
            .ok()
            .flatten()
            .unwrap_or_default(),
        atomic_facts: row
            .try_get::<Option<String>>("", "atomic_facts")
            .ok()
            .flatten()
            .unwrap_or_default(),
    });

    let public_url = state.config.s3_public_url.as_deref().unwrap_or("");
    let raw_images: Option<Value> = row.try_get("", "atomic_images")?;

    Ok(ElementData {
        id: row.try_get("", "id")?,
        atomic_number: num,
        atomic_group: row.try_get("", "atomic_group")?,
        atomic_name: row.try_get("", "atomic_name")?,
        atomic_symbol: row.try_get("", "atomic_symbol")?,
        atomic_properties: row
            .try_get::<Option<Value>>("", "atomic_properties")?
            .unwrap_or_else(|| json!({})),
        atomic_isotope: row
            .try_get::<Option<Value>>("", "atomic_isotope")?
            .unwrap_or_else(|| json!({})),
        atomic_extra: row
            .try_get::<Option<Value>>("", "atomic_extra")?
            .unwrap_or_else(|| json!({})),
        atomic_images: resolve_atomic_images(public_url, raw_images),
        notes,
        navigation: ElementNavigation { prev, next },
    })
}
