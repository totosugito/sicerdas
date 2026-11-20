use crate::app::AppState;
use crate::db::entities::education_grades;
use crate::error::AppError;
use crate::modules::education::types::{GradeData, GradeListBody, PaginatedData};
use crate::types::response::PaginationMeta;
use sea_orm::sea_query::{extension::postgres::PgExpr, Expr};
use sea_orm::{
    Condition, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect,
};

pub async fn list_grades(
    state: &AppState,
    body: GradeListBody,
) -> Result<PaginatedData<GradeData>, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 1000);
    let offset = (page - 1) * limit;

    let mut cond = Condition::all();
    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        let pat = format!("%{search}%");
        cond = cond.add(
            Condition::any()
                .add(Expr::col(education_grades::Column::Grade).ilike(pat.clone()))
                .add(Expr::col(education_grades::Column::Name).ilike(pat.clone()))
                .add(Expr::col(education_grades::Column::Desc).ilike(pat)),
        );
    }

    let base = education_grades::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let asc = body.sort_order.as_deref() == Some("asc");
    let ordered = match body.sort_by.as_deref() {
        Some("grade") => {
            if asc {
                base.order_by_asc(education_grades::Column::Grade)
            } else {
                base.order_by_desc(education_grades::Column::Grade)
            }
        }
        Some("name") => {
            if asc {
                base.order_by_asc(education_grades::Column::Name)
            } else {
                base.order_by_desc(education_grades::Column::Name)
            }
        }
        Some("createdAt") => {
            if asc {
                base.order_by_asc(education_grades::Column::CreatedAt)
            } else {
                base.order_by_desc(education_grades::Column::CreatedAt)
            }
        }
        _ => {
            if asc {
                base.order_by_asc(education_grades::Column::UpdatedAt)
            } else {
                base.order_by_desc(education_grades::Column::UpdatedAt)
            }
        }
    };

    let rows = ordered.offset(offset).limit(limit).all(&state.db).await?;
    Ok(PaginatedData {
        items: rows.into_iter().map(GradeData::from).collect(),
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
