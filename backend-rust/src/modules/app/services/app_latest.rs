use crate::app::AppState;
use crate::db::entities::app_version::{self, ContentStatus};
use crate::db::entities::users_profiles;
use crate::error::AppError;
use crate::modules::app::types::{
    AppLatestBook, AppLatestCategory, AppLatestData, AppLatestGrade, AppLatestGroup,
    AppLatestVersion,
};
use sea_orm::{ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, QueryFilter, QueryOrder, Statement};
use serde_json::{json, Value};
use std::env;
use uuid::Uuid;

fn ad_placement(id_key: &str, enabled_key: &str) -> Value {
    let id = env::var(id_key).unwrap_or_default();
    let enabled_env = env::var(enabled_key).map(|v| v != "false").unwrap_or(true);
    let enabled = !id.trim().is_empty() && enabled_env;
    json!({ "id": id, "enabled": enabled })
}

fn build_app_settings(state: &AppState, show_ads: bool) -> Value {
    let delay_counter: i64 = env::var("ADS_DELAY_COUNTER")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(3);
    let delay_secs: i64 = env::var("ADS_DELAY_TIME_IN_SEC")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or(60);

    json!({
        "cloudUrl": state.config.s3_public_url.clone().unwrap_or_default(),
        "ads": {
            "enabled": show_ads,
            "adsDelayCounter": delay_counter,
            "adsDelayTimeInSec": delay_secs,
            "android": {
                "adsProvider": env::var("ADS_ANDROID_PROVIDER").unwrap_or_else(|_| "admob".to_string()),
                "banner": ad_placement("ADS_ANDROID_BANNER_ID", "ADS_ANDROID_BANNER_ENABLED"),
                "rewards": ad_placement("ADS_ANDROID_REWARDED_ID", "ADS_ANDROID_REWARDED_ENABLED"),
                "interstitial": ad_placement("ADS_ANDROID_INTERSTITIAL_ID", "ADS_ANDROID_INTERSTITIAL_ENABLED"),
                "native": ad_placement("ADS_ANDROID_NATIVE_ID", "ADS_ANDROID_NATIVE_ENABLED"),
            },
            "ios": {
                "adsProvider": env::var("ADS_IOS_PROVIDER").unwrap_or_else(|_| "admob".to_string()),
                "banner": ad_placement("ADS_IOS_BANNER_ID", "ADS_IOS_BANNER_ENABLED"),
                "rewards": ad_placement("ADS_IOS_REWARDED_ID", "ADS_IOS_REWARDED_ENABLED"),
                "interstitial": ad_placement("ADS_IOS_INTERSTITIAL_ID", "ADS_IOS_INTERSTITIAL_ENABLED"),
                "native": ad_placement("ADS_IOS_NATIVE_ID", "ADS_IOS_NATIVE_ENABLED"),
            }
        }
    })
}

fn blocknote_to_html_simple(blocks: &Value) -> String {
    let Some(arr) = blocks.as_array() else {
        return String::new();
    };
    let mut out = String::new();
    for block in arr {
        let btype = block.get("type").and_then(|v| v.as_str()).unwrap_or("paragraph");
        let mut text = String::new();
        if let Some(content) = block.get("content").and_then(|v| v.as_array()) {
            for inline in content {
                if let Some(t) = inline.get("text").and_then(|v| v.as_str()) {
                    text.push_str(t);
                }
            }
        }
        match btype {
            "heading" => {
                let level = block
                    .get("props")
                    .and_then(|p| p.get("level"))
                    .and_then(|l| l.as_u64())
                    .unwrap_or(2)
                    .clamp(1, 6);
                out.push_str(&format!("<h{level}>{text}</h{level}>"));
            }
            "bulletListItem" | "numberedListItem" => {
                out.push_str(&format!("<li>{text}</li>"));
            }
            _ => {
                out.push_str(&format!("<p>{text}</p>"));
            }
        }
    }
    out
}

pub async fn get_app_latest(
    state: &AppState,
    current_db_version: i32,
    user_id: Option<Uuid>,
) -> Result<AppLatestData, AppError> {
    let mut user_tier = "free".to_string();
    if let Some(uid) = user_id {
        if let Some(prof) = users_profiles::Entity::find_by_id(uid).one(&state.db).await? {
            if let Some(t) = prof.tier_id {
                user_tier = t;
            }
        }
    }
    let show_ads = user_tier == "free";

    let mut client_version_id: i32 = 0;
    if current_db_version > 0 {
        if let Some(v) = app_version::Entity::find()
            .filter(app_version::Column::DbVersion.eq(current_db_version))
            .one(&state.db)
            .await?
        {
            client_version_id = v.id;
        }
    }

    let new_versions = app_version::Entity::find()
        .filter(app_version::Column::Status.eq(ContentStatus::Published))
        .filter(app_version::Column::DbVersion.gt(current_db_version))
        .order_by_asc(app_version::Column::DbVersion)
        .all(&state.db)
        .await?;

    let mut books = Vec::new();
    let mut grades = Vec::new();
    let mut categories = Vec::new();
    let mut groups = Vec::new();

    if !new_versions.is_empty() {
        let book_rows = state
            .db
            .query_all(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "SELECT id, book_id, version_id, title, description, author, published_year, total_pages, size, status::text AS status, book_group_id, education_grade_id FROM books WHERE version_id > $1",
                [client_version_id.into()],
            ))
            .await?;
        for r in book_rows {
            books.push(AppLatestBook {
                id: r.try_get("", "id")?,
                book_id: r.try_get("", "book_id")?,
                version_id: r.try_get("", "version_id")?,
                title: r.try_get("", "title")?,
                description: r.try_get("", "description")?,
                author: r.try_get("", "author")?,
                published_year: r.try_get("", "published_year")?,
                total_pages: r.try_get("", "total_pages")?,
                size: r.try_get("", "size")?,
                status: r.try_get("", "status")?,
                book_group_id: r.try_get("", "book_group_id")?,
                education_grade_id: r.try_get("", "education_grade_id")?,
            });
        }

        let grade_rows = state
            .db
            .query_all(Statement::from_string(
                DbBackend::Postgres,
                "SELECT id, grade, name, \"desc\" FROM education_grades",
            ))
            .await?;
        for r in grade_rows {
            grades.push(AppLatestGrade {
                id: r.try_get("", "id")?,
                grade: r.try_get("", "grade")?,
                name: r.try_get("", "name")?,
                desc: r.try_get("", "desc")?,
            });
        }

        let cat_rows = state
            .db
            .query_all(Statement::from_string(
                DbBackend::Postgres,
                "SELECT id, name, code, \"desc\" FROM book_category",
            ))
            .await?;
        for r in cat_rows {
            categories.push(AppLatestCategory {
                id: r.try_get("", "id")?,
                name: r.try_get("", "name")?,
                key: r.try_get("", "code")?,
                description: r.try_get("", "desc")?,
            });
        }

        let group_rows = state
            .db
            .query_all(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "SELECT bg.id, bg.version_id, bg.category_id, bg.name, bg.short_name, bg.\"desc\", bg.status::text AS status, COALESCE(bgs.book_total, 0)::bigint AS book_total FROM book_group bg LEFT JOIN book_group_stats bgs ON bgs.book_group_id = bg.id WHERE bg.version_id > $1",
                [client_version_id.into()],
            ))
            .await?;
        for r in group_rows {
            groups.push(AppLatestGroup {
                id: r.try_get("", "id")?,
                version_id: r.try_get("", "version_id")?,
                category_id: r.try_get("", "category_id")?,
                name: r.try_get("", "name")?,
                short_name: r.try_get("", "short_name")?,
                desc: r.try_get("", "desc")?,
                status: r.try_get("", "status")?,
                book_total: r.try_get("", "book_total")?,
            });
        }
    }

    let versions = new_versions
        .into_iter()
        .map(|v| {
            let html_note = blocknote_to_html_simple(&v.note);
            AppLatestVersion {
                id: v.id,
                app_version: v.app_version,
                db_version: v.db_version,
                data_type: v.data_type.as_str().to_string(),
                status: v.status.as_str().to_string(),
                name: v.name.unwrap_or_default(),
                html_note,
                extra: v.extra.unwrap_or_else(|| json!({})),
            }
        })
        .collect();

    Ok(AppLatestData {
        versions,
        books,
        grades,
        categories,
        groups,
        settings: build_app_settings(state, show_ads),
    })
}
