use crate::app::AppState;
use crate::error::AppError;
use crate::modules::course::types::{
    FilterParamsCategoryItem, FilterParamsGrade, FilterParamsGradeStats,
};
use indexmap::IndexMap;
use sea_orm::{DbBackend, FromQueryResult, Statement};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct CourseFilterRow {
    category_id: Uuid,
    category_name: String,
    category_key: String,
    category_description: Option<String>,
    grade_id: i32,
    grade_name: String,
    course_count: i64,
}

pub async fn filter_params(state: &AppState) -> Result<Vec<FilterParamsCategoryItem>, AppError> {
    let rows = CourseFilterRow::find_by_statement(Statement::from_string(
        DbBackend::Postgres,
        r#"
        SELECT
            ec.id AS category_id,
            ec.name AS category_name,
            ec.key AS category_key,
            ec.description AS category_description,
            eg.id AS grade_id,
            eg.name AS grade_name,
            COUNT(c.id)::bigint AS course_count
        FROM courses c
        INNER JOIN education_categories ec ON c.category_id = ec.id
        INNER JOIN education_grades eg ON c.education_grade_id = eg.id
        WHERE c.status = 'published'::status AND c.is_public = true
        GROUP BY ec.id, ec.name, ec.key, ec.description, eg.id, eg.name
        ORDER BY ec.name ASC, eg.id ASC
        "#,
    ))
    .all(&state.db)
    .await?;

    let mut map: IndexMap<Uuid, FilterParamsCategoryItem> = IndexMap::new();
    for row in rows {
        let entry = map.entry(row.category_id).or_insert_with(|| FilterParamsCategoryItem {
            id: row.category_id,
            name: row.category_name,
            key: row.category_key,
            description: row.category_description,
            grades: Vec::new(),
        });
        entry.grades.push(FilterParamsGrade {
            id: row.grade_id,
            name: row.grade_name,
            stats: FilterParamsGradeStats {
                active_count: row.course_count,
                total_count: row.course_count,
            },
        });
    }

    Ok(map.into_values().collect())
}
