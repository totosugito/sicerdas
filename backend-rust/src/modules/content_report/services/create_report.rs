use crate::app::AppState;
use crate::db::entities::content_report::{self, ReportStatus};
use crate::error::AppError;
use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::content_report::types::{CreateReportBody, CreateReportData};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, Set};
use serde_json::json;
use uuid::Uuid;

pub async fn create_report(
    state: &AppState,
    body: CreateReportBody,
    reporter_id: Option<Uuid>,
    locale: RequestLocale,
) -> Result<CreateReportData, AppError> {
    if body.name.trim().is_empty() || body.title.trim().is_empty() || body.email.trim().is_empty() {
        return Err(AppError::BadRequest(locale.t(LocaleKey::ReportCreateError)));
    }

    let now = Utc::now().fixed_offset();
    let id = Uuid::new_v4();

    let inserted = content_report::ActiveModel {
        id: Set(id),
        reporter_id: Set(reporter_id),
        name: Set(body.name.trim().to_string()),
        email: Set(body.email.trim().to_string()),
        title: Set(body.title.trim().to_string()),
        content_type: Set(body.content_type),
        reference_id: Set(body.reference_id),
        reason: Set(body.reason),
        description: Set(body.description),
        status: Set(ReportStatus::Pending),
        created_at: Set(now),
        updated_at: Set(now),
        extra: Set(Some(body.extra.unwrap_or_else(|| json!({})))),
        resolved_at: Set(None),
        resolved_by: Set(None),
        resolution_notes: Set(None),
    }
    .insert(&state.db)
    .await
    .map_err(|_| AppError::Internal(locale.t(LocaleKey::ReportCreateError)))?;

    Ok(CreateReportData { id: inserted.id })
}
