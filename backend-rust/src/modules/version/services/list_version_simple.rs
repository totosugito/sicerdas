use crate::app::AppState;
use crate::db::entities::app_version::{self, ContentStatus};
use crate::error::AppError;
use crate::modules::version::types::{
    ListVersionSimpleBody, ListVersionSimpleData, VersionSimpleItem,
};
use crate::types::response::PaginationMeta;
use sea_orm::sea_query::{extension::postgres::PgExpr, Expr};
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect,
};

pub async fn list_versions_simple(
    state: &AppState,
    body: ListVersionSimpleBody,
) -> Result<ListVersionSimpleData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(1000).clamp(1, 2000);
    let offset = (page - 1) * limit;

    let mut cond = Condition::all().add(app_version::Column::DataType.eq(body.data_type));
    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        cond = cond.add(Expr::col(app_version::Column::Name).ilike(format!("%{search}%")));
    }

    let base = app_version::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let rows = base
        .order_by_desc(app_version::Column::AppVersion)
        .order_by_desc(app_version::Column::DbVersion)
        .offset(offset)
        .limit(limit)
        .all(&state.db)
        .await?;

    let items = rows
        .into_iter()
        .map(|v| VersionSimpleItem {
            id: v.id,
            name: v.name.unwrap_or_default(),
            published: v.status == ContentStatus::Published,
        })
        .collect();

    Ok(ListVersionSimpleData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
