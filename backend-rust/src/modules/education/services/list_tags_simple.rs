use crate::app::AppState;
use crate::db::entities::education_tags;
use crate::error::AppError;
use crate::modules::education::types::{PaginatedData, TagSimpleBody, TagSimpleData};
use crate::types::response::PaginationMeta;
use sea_orm::{ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect};

pub async fn list_tags_simple(
    state: &AppState,
    body: TagSimpleBody,
) -> Result<PaginatedData<TagSimpleData>, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(1000).clamp(1, 2000);
    let offset = (page - 1) * limit;

    let base = education_tags::Entity::find().filter(education_tags::Column::IsActive.eq(true));
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let rows = base
        .order_by_asc(education_tags::Column::Name)
        .offset(offset)
        .limit(limit)
        .all(&state.db)
        .await?;

    let items = rows
        .into_iter()
        .map(|t| TagSimpleData {
            value: t.id.to_string(),
            label: t.name,
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
