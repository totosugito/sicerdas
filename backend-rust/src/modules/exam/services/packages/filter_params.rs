use crate::app::AppState;
use crate::error::AppError;
use crate::modules::exam::types::{
    FilterParamCategory, FilterParamGrade, FilterParamGradeStats,
};
use sea_orm::{DbBackend, FromQueryResult, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct FilterParamRow {
    category_id: Uuid,
    category_name: String,
    category_key: String,
    category_description: Option<String>,
    grade_id: i32,
    grade_name: String,
    active_count: i32,
    total_count: i32,
}

pub async fn filter_params(state: &AppState) -> Result<Vec<FilterParamCategory>, AppError> {
    let rows = FilterParamRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        SELECT
            ec.id AS category_id,
            ec.name AS category_name,
            ec.key AS category_key,
            ec.description AS category_description,
            eg.id AS grade_id,
            eg.name AS grade_name,
            COALESCE(ecgs.active_count, 0) AS active_count,
            COALESCE(ecgs.total_count, 0) AS total_count
        FROM education_category_grade_stats ecgs
        INNER JOIN education_categories ec ON ec.id = ecgs.category_id
        INNER JOIN education_grades eg ON eg.id = ecgs.education_grade_id
        WHERE ecgs.content_type = 'exam' AND ecgs.active_count > 0
        ORDER BY ec.name ASC, eg.id ASC
        "#,
        vec![],
    ))
    .all(&state.db)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    let mut categories: Vec<FilterParamCategory> = Vec::new();
    for row in rows {
        let grade = FilterParamGrade {
            id: row.grade_id,
            name: row.grade_name,
            stats: FilterParamGradeStats {
                active_count: row.active_count,
                total_count: row.total_count,
            },
        };
        if let Some(cat) = categories.iter_mut().find(|c| c.id == row.category_id) {
            cat.grades.push(grade);
        } else {
            categories.push(FilterParamCategory {
                id: row.category_id,
                name: row.category_name,
                key: row.category_key,
                description: row.category_description,
                grades: vec![grade],
            });
        }
    }

    Ok(categories)
}
