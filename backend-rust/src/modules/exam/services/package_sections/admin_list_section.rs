use crate::app::AppState;
use crate::db::entities::exam::exam_packages;
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{
    AdminSectionItem, AdminSectionListBody, AdminSectionListData, AdminSectionPackageHeader,
};
use crate::types::response::PaginationMeta;
use chrono::{DateTime, Utc};
use sea_orm::{DbBackend, EntityTrait, FromQueryResult, Statement, Value};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct AdminSectionRow {
    id: Uuid,
    package_id: Uuid,
    title: String,
    group_name: Option<String>,
    description: Option<String>,
    duration_minutes: i32,
    order: i32,
    is_active: bool,
    version_id: Option<i32>,
    question_limit: i32,
    is_random_item: bool,
    is_random_choice: bool,
    total_questions: i32,
    active_questions: i32,
    max_score: f64,
    package_name: Option<String>,
    parent_package_id: Option<Uuid>,
    is_new: bool,
    created_at: DateTime<Utc>,
    updated_at: DateTime<Utc>,
}

#[derive(Debug, FromQueryResult)]
struct CountRow {
    total: i64,
}

pub async fn admin_list_section(
    state: &AppState,
    lang: Lang,
    is_admin: bool,
    latest_version_id: Option<i32>,
    body: AdminSectionListBody,
) -> Result<AdminSectionListData, AppError> {
    let page = body.page.unwrap_or(1).max(1);
    let limit = body.limit.unwrap_or(10).clamp(1, 100);
    let offset = (page - 1) * limit;

    let mut pkg_header = AdminSectionPackageHeader {
        package_id: String::new(),
        package_name: String::new(),
    };

    let mut conditions = Vec::new();
    let mut params: Vec<Value> = Vec::new();

    if let Some(pkg_id) = body.package_id {
        let pkg = exam_packages::Entity::find_by_id(pkg_id)
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?
            .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDetailNotFound)))?;

        pkg_header.package_id = pkg.id.to_string();
        pkg_header.package_name = pkg.title;
        params.push(Value::Uuid(Some(Box::new(pkg_id))));
        conditions.push(format!("eps.package_id = ${}", params.len()));
    }

    if let Some(ref search) = body.search {
        let trimmed = search.trim();
        if !trimmed.is_empty() {
            params.push(Value::String(Some(Box::new(format!("%{trimmed}%")))));
            conditions.push(format!("eps.title ILIKE ${}", params.len()));
        }
    }

    if let Some(ref exam_types) = body.exam_type {
        if !exam_types.is_empty() {
            params.push(Value::Array(
                sea_orm::sea_query::ArrayType::String,
                Some(Box::new(
                    exam_types
                        .iter()
                        .map(|s| Value::String(Some(Box::new(s.clone()))))
                        .collect(),
                )),
            ));
            conditions.push(format!("ep.exam_type::text = ANY(${})", params.len()));
        }
    }

    if !is_admin {
        conditions.push("eps.is_active = true".to_string());
    } else if let Some(is_active) = body.is_active {
        params.push(Value::Bool(Some(is_active)));
        conditions.push(format!("eps.is_active = ${}", params.len()));
    }

    let where_sql = if conditions.is_empty() {
        String::new()
    } else {
        format!("WHERE {}", conditions.join(" AND "))
    };

    let count_sql = format!(
        r#"
        SELECT COUNT(*) AS total
        FROM exam_package_sections eps
        LEFT JOIN exam_packages ep ON ep.id = eps.package_id
        {where_sql}
        "#
    );
    let total = CountRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        count_sql,
        params.clone(),
    ))
    .one(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?
    .map(|r| r.total as u64)
    .unwrap_or(0);

    let sort_col = match body.sort_by.as_deref() {
        Some("title") => "eps.title",
        Some("order") => "eps.\"order\"",
        Some("totalQuestions") => "eps.total_questions",
        Some("isActive") if is_admin => "eps.is_active",
        Some("isActive") => "eps.\"order\"",
        Some("createdAt") => "eps.created_at",
        _ => "eps.updated_at",
    };
    let sort_dir = match body.sort_order.as_deref() {
        Some("asc") => "ASC",
        _ => "DESC",
    };

    let is_new_sql = match latest_version_id {
        Some(vid) => format!("COALESCE(eps.version_id = {vid}, false)"),
        None => "false".to_string(),
    };

    params.push(Value::BigInt(Some(limit as i64)));
    let limit_idx = params.len();
    params.push(Value::BigInt(Some(offset as i64)));
    let offset_idx = params.len();

    let sql = format!(
        r#"
        SELECT
            eps.id,
            eps.package_id,
            eps.title,
            eps.group_name,
            eps.description,
            eps.duration_minutes,
            eps."order",
            eps.is_active,
            eps.version_id,
            eps.question_limit,
            eps.is_random_item,
            eps.is_random_choice,
            eps.total_questions,
            eps.active_questions,
            COALESCE(eps.max_score::float8, 0.0) AS max_score,
            ep.title AS package_name,
            ep.parent_package_id,
            {is_new_sql} AS is_new,
            eps.created_at,
            eps.updated_at
        FROM exam_package_sections eps
        LEFT JOIN exam_packages ep ON ep.id = eps.package_id
        {where_sql}
        ORDER BY {sort_col} {sort_dir}
        LIMIT ${limit_idx} OFFSET ${offset_idx}
        "#
    );

    let rows = AdminSectionRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        params,
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let items = rows
        .into_iter()
        .map(|r| AdminSectionItem {
            id: r.id,
            package_id: r.package_id,
            title: r.title,
            group_name: r.group_name,
            description: r.description,
            duration_minutes: r.duration_minutes,
            order: r.order,
            is_active: r.is_active,
            version_id: r.version_id,
            question_limit: r.question_limit,
            is_random_item: r.is_random_item,
            is_random_choice: r.is_random_choice,
            total_questions: r.total_questions,
            active_questions: r.active_questions,
            max_score: r.max_score,
            package_name: r.package_name,
            parent_package_id: r.parent_package_id,
            is_new: r.is_new,
            created_at: r.created_at.to_rfc3339(),
            updated_at: r.updated_at.to_rfc3339(),
        })
        .collect();

    let total_pages = if total == 0 {
        0
    } else {
        (total + limit - 1) / limit
    };

    Ok(AdminSectionListData {
        package: pkg_header,
        items,
        meta: PaginationMeta {
            total,
            page,
            limit,
            total_pages,
        },
    })
}
