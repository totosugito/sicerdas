use crate::app::AppState;
use crate::db::entities::app_version;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use sea_orm::{ConnectionTrait, DbBackend, EntityTrait, Statement};

pub async fn delete_version(
    state: &AppState,
    id: i32,
    locale: RequestLocale,
) -> Result<(), AppError> {
    let _existing = app_version::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::VersionNotFound)))?;

    for table in ["books", "exam_packages", "exam_package_sections"] {
        let sql = format!("SELECT COUNT(*)::bigint AS cnt FROM {table} WHERE version_id = $1");
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
                return Err(AppError::BadRequest(
                    locale.t(LocaleKey::VersionDeleteInUse),
                ));
            }
        }
    }

    app_version::Entity::delete_by_id(id)
        .exec(&state.db)
        .await?;

    Ok(())
}
