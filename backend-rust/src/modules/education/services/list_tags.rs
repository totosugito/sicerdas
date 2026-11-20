use crate::app::AppState;
use crate::db::entities::education_tags;
use crate::error::AppError;
use crate::modules::education::types::{PaginatedData, TagData, TagListBody};
use crate::types::response::PaginationMeta;
use sea_orm::sea_query::{extension::postgres::PgExpr, Expr};
use sea_orm::{
    ColumnTrait, Condition, ConnectionTrait, DbBackend, EntityTrait, PaginatorTrait, QueryFilter,
    QueryOrder, QuerySelect, Statement,
};
use std::collections::HashMap;
use uuid::Uuid;

pub async fn list_tags(
    state: &AppState,
    body: TagListBody,
) -> Result<PaginatedData<TagData>, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 50);
    let offset = (page - 1) * limit;

    let mut cond = Condition::all();
    if let Some(is_active) = body.is_active {
        cond = cond.add(education_tags::Column::IsActive.eq(is_active));
    }
    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        let pat = format!("%{search}%");
        cond = cond.add(
            Condition::any()
                .add(Expr::col(education_tags::Column::Name).ilike(pat.clone()))
                .add(Expr::col(education_tags::Column::Description).ilike(pat)),
        );
    }

    let base = education_tags::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let asc = body.sort_order.as_deref() == Some("asc");
    let ordered = match body.sort_by.as_deref() {
        Some("name") => {
            if asc {
                base.order_by_asc(education_tags::Column::Name)
            } else {
                base.order_by_desc(education_tags::Column::Name)
            }
        }
        Some("createdAt") => {
            if asc {
                base.order_by_asc(education_tags::Column::CreatedAt)
            } else {
                base.order_by_desc(education_tags::Column::CreatedAt)
            }
        }
        _ => {
            if asc {
                base.order_by_asc(education_tags::Column::UpdatedAt)
            } else {
                base.order_by_desc(education_tags::Column::UpdatedAt)
            }
        }
    };

    let rows = ordered.offset(offset).limit(limit).all(&state.db).await?;

    let mut counts: HashMap<Uuid, i64> = HashMap::new();
    if !rows.is_empty() {
        let count_rows = state
            .db
            .query_all(Statement::from_string(
                DbBackend::Postgres,
                "SELECT tag_id, COUNT(*)::bigint AS cnt FROM exam_question_tags GROUP BY tag_id",
            ))
            .await?;
        for r in count_rows {
            if let (Ok(tid), Ok(cnt)) = (r.try_get::<Uuid>("", "tag_id"), r.try_get::<i64>("", "cnt")) {
                counts.insert(tid, cnt);
            }
        }
    }

    let items = rows
        .into_iter()
        .map(|t| TagData {
            id: t.id,
            name: t.name,
            description: t.description,
            is_active: t.is_active,
            total_questions: *counts.get(&t.id).unwrap_or(&0),
            created_at: t.created_at.to_rfc3339(),
            updated_at: t.updated_at.to_rfc3339(),
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
