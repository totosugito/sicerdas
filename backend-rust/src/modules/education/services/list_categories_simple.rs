use crate::app::AppState;
use crate::db::entities::education_categories;
use crate::error::AppError;
use crate::modules::education::types::{CategorySimpleBody, CategorySimpleData, PaginatedData};
use crate::types::response::PaginationMeta;
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect};

pub async fn list_categories_simple(
    state: &AppState,
    body: CategorySimpleBody,
) -> Result<PaginatedData<CategorySimpleData>, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(1000).clamp(1, 2000);
    let offset = (page - 1) * limit;

    let base = education_categories::Entity::find()
        .filter(education_categories::Column::IsActive.eq(true));
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let rows = base
        .order_by_asc(education_categories::Column::Name)
        .offset(offset)
        .limit(limit)
        .all(&state.db)
        .await?;

    let items = rows
        .into_iter()
        .map(|c| CategorySimpleData {
            value: c.id,
            label: c.name,
            key: c.key,
        })
        .collect();

    Ok(PaginatedData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
