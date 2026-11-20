use crate::app::AppState;
use crate::db::entities::users;
use crate::error::AppError;
use crate::modules::auth::services::session::resolve_avatar_url;
use crate::modules::users::types::{ListUsersBody, ListUsersData, UserResponseItem};
use crate::types::response::PaginationMeta;
use sea_orm::sea_query::{extension::postgres::PgExpr, Expr};
use sea_orm::{
    ColumnTrait, Condition, EntityTrait, PaginatorTrait, QueryFilter, QueryOrder, QuerySelect,
};

pub async fn list_users(state: &AppState, body: ListUsersBody) -> Result<ListUsersData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut cond = Condition::all();
    if let Some(search) = body.search.as_deref().map(str::trim).filter(|s| !s.is_empty()) {
        let pattern = format!("%{}%", search.to_lowercase());
        cond = cond.add(
            Condition::any()
                .add(Expr::col(users::Column::Name).ilike(pattern.clone()))
                .add(Expr::col(users::Column::Email).ilike(pattern)),
        );
    }
    if let Some(roles) = body.roles.filter(|r| !r.is_empty()) {
        cond = cond.add(users::Column::Role.is_in(roles));
    }

    let base = users::Entity::find().filter(cond);
    let total = base.clone().count(&state.db).await?;
    let total_pages = (total as f64 / limit as f64).ceil() as u64;

    let asc = body.sort_order.as_deref() == Some("asc");
    let ordered = match body.sort_by.as_deref() {
        Some("name") => {
            if asc {
                base.order_by_asc(users::Column::Name)
            } else {
                base.order_by_desc(users::Column::Name)
            }
        }
        Some("email") => {
            if asc {
                base.order_by_asc(users::Column::Email)
            } else {
                base.order_by_desc(users::Column::Email)
            }
        }
        Some("role") => {
            if asc {
                base.order_by_asc(users::Column::Role)
            } else {
                base.order_by_desc(users::Column::Role)
            }
        }
        Some("updatedAt") => {
            if asc {
                base.order_by_asc(users::Column::UpdatedAt)
            } else {
                base.order_by_desc(users::Column::UpdatedAt)
            }
        }
        _ => {
            if asc {
                base.order_by_asc(users::Column::CreatedAt)
            } else {
                base.order_by_desc(users::Column::CreatedAt)
            }
        }
    };

    let rows = ordered.offset(offset).limit(limit).all(&state.db).await?;

    let items = rows
        .into_iter()
        .map(|u| {
            let image = resolve_avatar_url(&state.config, u.image.as_deref());
            UserResponseItem {
                id: u.id,
                email: u.email,
                name: u.name,
                image,
                created_at: u.created_at.to_rfc3339(),
                updated_at: u.updated_at.to_rfc3339(),
                role: u.role,
                banned: u.banned,
                ban_reason: u.ban_reason,
            }
        })
        .collect();

    Ok(ListUsersData {
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
