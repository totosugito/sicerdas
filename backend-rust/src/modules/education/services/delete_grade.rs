use crate::app::AppState;
use crate::db::entities::education_grades;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use sea_orm::{ConnectionTrait, DbBackend, EntityTrait, Statement};

pub async fn delete_grade(
    state: &AppState,
    id: i32,
    locale: RequestLocale,
) -> Result<(), AppError> {
    let _existing = education_grades::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::EducationGradesDeleteNotFound)))?;

    let checks = [
        ("books", LocaleKey::EducationGradesDeleteInUseBook),
        ("exam_packages", LocaleKey::EducationGradesDeleteInUsePackage),
        ("exam_questions", LocaleKey::EducationGradesDeleteInUseQuestion),
    ];

    for (table, err_key) in checks {
        let sql = format!("SELECT COUNT(*)::bigint AS cnt FROM {table} WHERE education_grade_id = $1");
        let row = state
            .db
            .query_one(Statement::from_sql_and_values(
                DbBackend::Postgres,
                &sql,
                [id.into()],
            ))
            .await?;
        if let Some(r) = row {
            let cnt: i64 = r.try_get("", "cnt").unwrap_or(0);
            if cnt > 0 {
                return Err(AppError::BadRequest(locale.t(err_key)));
            }
        }
    }

    education_grades::Entity::delete_by_id(id)
        .exec(&state.db)
        .await?;

    Ok(())
}
