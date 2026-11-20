use crate::app::AppState;
use crate::db::entities::education_grades;
use crate::error::AppError;
use crate::modules::education::types::{GradeSimpleBody, GradeSimpleData, PaginatedData};
use crate::types::response::PaginationMeta;
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect,
};

pub async fn list_grades_simple(
    state: &AppState,
    body: GradeSimpleBody,
) -> Result<PaginatedData<GradeSimpleData>, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(1000).clamp(1, 2000);
    let offset = (page - 1) * limit;

    let mut cond = Condition::all();
    if let Some(is_default) = body.is_default {
        cond = cond.add(education_grades::Column::IsDefault.eq(is_default));
    }

    let base = education_grades::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let rows = base
        .order_by_asc(education_grades::Column::Id)
        .offset(offset)
        .limit(limit)
        .all(&state.db)
        .await?;

    let items = rows
        .into_iter()
        .map(|g| GradeSimpleData {
            value: g.id.to_string(),
            label: g.name,
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
