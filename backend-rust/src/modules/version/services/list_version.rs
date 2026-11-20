use crate::app::AppState;
use crate::db::entities::app_version;
use crate::error::AppError;
use crate::modules::version::types::{ListVersionBody, ListVersionData, VersionItem};
use crate::types::response::PaginationMeta;
use sea_orm::sea_query::{extension::postgres::PgExpr, Expr};
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect,
};

pub async fn list_versions(
    state: &AppState,
    body: ListVersionBody,
) -> Result<ListVersionData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut cond = Condition::all();
    if let Some(dt) = body.data_type {
        cond = cond.add(app_version::Column::DataType.eq(dt));
    }
    if let Some(st) = body.status {
        cond = cond.add(app_version::Column::Status.eq(st));
    }
    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        cond = cond.add(Expr::col(app_version::Column::Name).ilike(format!("%{search}%")));
    }

    let base = app_version::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let asc = body.sort_order.as_deref() == Some("asc");
    let ordered = match body.sort_by.as_deref() {
        Some("appVersion") => {
            if asc {
                base.order_by_asc(app_version::Column::AppVersion)
            } else {
                base.order_by_desc(app_version::Column::AppVersion)
            }
        }
        Some("dbVersion") => {
            if asc {
                base.order_by_asc(app_version::Column::DbVersion)
            } else {
                base.order_by_desc(app_version::Column::DbVersion)
            }
        }
        Some("name") => {
            if asc {
                base.order_by_asc(app_version::Column::Name)
            } else {
                base.order_by_desc(app_version::Column::Name)
            }
        }
        _ => {
            if asc {
                base.order_by_asc(app_version::Column::CreatedAt)
            } else {
                base.order_by_desc(app_version::Column::CreatedAt)
            }
        }
    };

    let rows = ordered.offset(offset).limit(limit).all(&state.db).await?;
    Ok(ListVersionData {
        items: rows.into_iter().map(VersionItem::from).collect(),
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
