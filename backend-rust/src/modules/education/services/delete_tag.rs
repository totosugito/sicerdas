use crate::app::AppState;
use crate::db::entities::education_tags;
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use sea_orm::{ConnectionTrait, DbBackend, EntityTrait, Statement};
use uuid::Uuid;

pub async fn delete_tag(
    state: &AppState,
    id: Uuid,
    locale: RequestLocale,
) -> Result<(), AppError> {
    let _existing = education_tags::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::NotFound(locale.t(LocaleKey::EducationTagsDeleteNotFound)))?;

    let row = state
        .db
        .query_one(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "SELECT COUNT(*)::bigint AS cnt FROM exam_question_tags WHERE tag_id = $1",
            [id.into()],
        ))
        .await?;

    if let Some(r) = row {
        let cnt: i64 = r.try_get("", "cnt").unwrap_or(0);
        if cnt > 0 {
            return Err(AppError::BadRequest(
                locale.t(LocaleKey::EducationTagsDeleteInUse),
            ));
        }
    }

    education_tags::Entity::delete_by_id(id)
        .exec(&state.db)
        .await?;

    Ok(())
}
