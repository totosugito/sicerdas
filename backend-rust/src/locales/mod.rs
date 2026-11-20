use axum::{
    extract::{FromRequestParts, Request},
    http::request::Parts,
    middleware::Next,
    response::Response,
};
use std::convert::Infallible;
use serde_json::Value;
use std::collections::HashMap;
use std::sync::OnceLock;

include!(concat!(env!("OUT_DIR"), "/locale_keys.rs"));

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Lang {
    Id,
    En,
}

#[derive(Debug, Clone, Copy)]
pub struct RequestLocale(pub Lang);

impl RequestLocale {
    pub fn t(&self, key: LocaleKey) -> String {
        translate(self.0, key)
    }
}

impl<S: Send + Sync> FromRequestParts<S> for RequestLocale {
    type Rejection = Infallible;

    async fn from_request_parts(parts: &mut Parts, _state: &S) -> Result<Self, Self::Rejection> {
        Ok(parts
            .extensions
            .get::<RequestLocale>()
            .copied()
            .unwrap_or(RequestLocale(Lang::Id)))
    }
}

static ID_MAP: OnceLock<HashMap<String, String>> = OnceLock::new();
static EN_MAP: OnceLock<HashMap<String, String>> = OnceLock::new();

fn flatten(prefix: &str, val: &Value, out: &mut HashMap<String, String>) {
    match val {
        Value::Object(map) => {
            for (k, v) in map {
                let next = if prefix.is_empty() {
                    k.clone()
                } else {
                    format!("{prefix}.{k}")
                };
                flatten(&next, v, out);
            }
        }
        Value::String(s) => {
            out.insert(prefix.to_string(), s.clone());
        }
        _ => {}
    }
}

fn load_id_map() -> &'static HashMap<String, String> {
    ID_MAP.get_or_init(|| {
        let mut map = HashMap::new();
        let files: &[&str] = &[
            include_str!("../../locales/id/auth.json"),
            include_str!("../../locales/id/book.json"),
            include_str!("../../locales/id/chat-ai.json"),
            include_str!("../../locales/id/course.json"),
            include_str!("../../locales/id/dictionary.json"),
            include_str!("../../locales/id/education.json"),
            include_str!("../../locales/id/exam.json"),
            include_str!("../../locales/id/periodic.json"),
            include_str!("../../locales/id/report.json"),
            include_str!("../../locales/id/tier.json"),
            include_str!("../../locales/id/user.json"),
            include_str!("../../locales/id/version.json"),
        ];
        for raw in files {
            if let Ok(val) = serde_json::from_str::<Value>(raw) {
                flatten("", &val, &mut map);
            }
        }
        map
    })
}

fn load_en_map() -> &'static HashMap<String, String> {
    EN_MAP.get_or_init(HashMap::new)
}

pub fn translate(lang: Lang, key: LocaleKey) -> String {
    let k = key.as_str();
    if lang == Lang::En {
        if let Some(v) = load_en_map().get(k) {
            return v.clone();
        }
    }
    load_id_map()
        .get(k)
        .cloned()
        .unwrap_or_else(|| k.to_string())
}

pub fn tr(key: LocaleKey) -> String {
    translate(Lang::Id, key)
}

pub async fn locale_middleware(mut req: Request, next: Next) -> Response {
    let lang = req
        .headers()
        .get(axum::http::header::ACCEPT_LANGUAGE)
        .and_then(|v| v.to_str().ok())
        .map(|s| {
            if s.to_ascii_lowercase().starts_with("en") {
                Lang::En
            } else {
                Lang::Id
            }
        })
        .unwrap_or(Lang::Id);

    req.extensions_mut().insert(RequestLocale(lang));
    next.run(req).await
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn all_locale_keys_resolve() {
        for &key in ALL_LOCALE_KEYS {
            let val = tr(key);
            assert!(
                !val.is_empty(),
                "LocaleKey {:?} ({}) resolved to empty string",
                key,
                key.as_str()
            );
        }
    }
}
