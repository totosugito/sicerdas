use crate::app::AppState;
use crate::error::AppError;
use crate::locales::{Lang, LocaleKey, RequestLocale};
use crate::modules::periodic_table::services::detail_element::get_element_detail;
use crate::types::response::ApiResponse;
use axum::{response::IntoResponse, 
    extract::{Path, State},
};

pub async fn handler(
    State(state): State<AppState>,
    locale: RequestLocale,
    Path(atomic_number): Path<i32>,
) -> Result<impl IntoResponse, AppError> {
    let locale_code = match locale.0 {
        Lang::En => "en",
        Lang::Id => "id",
    };
    let data = get_element_detail(&state, atomic_number, locale_code, locale).await?;
    Ok(ApiResponse::ok(
        locale.t(LocaleKey::PeriodicSuccess),
        data,
    ))
}
