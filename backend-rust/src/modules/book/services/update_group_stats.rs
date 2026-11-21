use crate::app::AppState;
use crate::db::entities::app_version::ContentStatus;
use crate::db::entities::{book_group, book_group_stats, books};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::book::types::GroupStatsItem;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, EntityTrait, PaginatorTrait, QueryFilter, Set,
};

pub async fn update_group_stats(
    state: &AppState,
    lang: Lang,
    group_id: i32,
) -> Result<GroupStatsItem, AppError> {
    let existing = book_group::Entity::find_by_id(group_id)
        .one(&state.db)
        .await?;
    if existing.is_none() {
        return Err(AppError::NotFound(locales::translate(
            lang,
            LocaleKey::BookGroupStatsNotFound,
        )));
    }

    let book_total = books::Entity::find()
        .filter(books::Column::BookGroupId.eq(group_id))
        .filter(books::Column::Status.eq(ContentStatus::Published))
        .count(&state.db)
        .await? as i32;

    let now = Utc::now();
    let existing_stats = book_group_stats::Entity::find()
        .filter(book_group_stats::Column::BookGroupId.eq(group_id))
        .one(&state.db)
        .await?;

    let saved = if let Some(stats) = existing_stats {
        let mut active: book_group_stats::ActiveModel = stats.into();
        active.book_total = Set(Some(book_total));
        active.updated_at = Set(Some(now.into()));
        active.update(&state.db).await?
    } else {
        let active = book_group_stats::ActiveModel {
            book_group_id: Set(group_id),
            book_total: Set(Some(book_total)),
            created_at: Set(Some(now.into())),
            updated_at: Set(Some(now.into())),
            ..Default::default()
        };
        active.insert(&state.db).await?
    };

    Ok(GroupStatsItem {
        group_id: saved.book_group_id,
        book_total: saved.book_total.unwrap_or(0),
        updated_at: saved
            .updated_at
            .map(|d| d.to_rfc3339())
            .unwrap_or_else(|| now.to_rfc3339()),
    })
}
