use crate::app::AppState;
use crate::db::entities::education_categories;
use crate::error::AppError;
use crate::modules::education::types::{CategoryData, CategoryListBody, PaginatedData};
use crate::types::response::PaginationMeta;
use sea_orm::sea_query::{extension::postgres::PgExpr, Expr};
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect,
};

pub async fn list_categories(
    state: &AppState,
    body: CategoryListBody,
) -> Result<PaginatedData<CategoryData>, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 1000);
    let offset = (page - 1) * limit;

    let mut cond = Condition::all();
    if let Some(is_active) = body.is_active {
        cond = cond.add(education_categories::Column::IsActive.eq(is_active));
    }
    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        let pat = format!("%{search}%");
        cond = cond.add(
            Condition::any()
                .add(Expr::col(education_categories::Column::Name).ilike(pat.clone()))
                .add(Expr::col(education_categories::Column::Description).ilike(pat)),
        );
    }

    let base = education_categories::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let asc = body.sort_order.as_deref() == Some("asc");
    let ordered = match body.sort_by.as_deref() {
        Some("name") => {
            if asc {
                base.order_by_asc(education_categories::Column::Name)
            } else {
                base.order_by_desc(education_categories::Column::Name)
            }
        }
        Some("createdAt") => {
            if asc {
                base.order_by_asc(education_categories::Column::CreatedAt)
            } else {
                base.order_by_desc(education_categories::Column::CreatedAt)
            }
        }
        _ => {
            if asc {
                base.order_by_asc(education_categories::Column::UpdatedAt)
            } else {
                base.order_by_desc(education_categories::Column::UpdatedAt)
            }
        }
    };

    let rows = ordered.offset(offset).limit(limit).all(&state.db).await?;
    Ok(PaginatedData {
        items: rows.into_iter().map(CategoryData::from).collect(),
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
