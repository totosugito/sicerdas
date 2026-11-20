use crate::locales::{LocaleKey, RequestLocale};
use crate::modules::app::services::dictionary_data::list_dictionary_packages;
use crate::types::response::ApiResponse;
use axum::response::IntoResponse;

pub async fn handler(locale: RequestLocale) -> impl IntoResponse {
    let data = list_dictionary_packages();
    ApiResponse::ok(
        locale.t(LocaleKey::DictionarySuccess),
        data,
    )
}
