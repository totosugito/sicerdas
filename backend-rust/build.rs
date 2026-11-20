use serde_json::Value;
use std::collections::HashSet;
use std::env;
use std::fs;
use std::path::Path;

fn main() {
    let locales_dir = Path::new("locales/id");
    println!("cargo:rerun-if-changed={}", locales_dir.display());

    let mut entries: Vec<(String, String)> = Vec::new();
    let mut seen_variants: HashSet<String> = HashSet::new();

    let mut files: Vec<_> = fs::read_dir(locales_dir)
        .expect("Failed to read locales/id directory")
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| p.extension().and_then(|s| s.to_str()) == Some("json"))
        .collect();
    files.sort();

    for path in files {
        println!("cargo:rerun-if-changed={}", path.display());
        let content = fs::read_to_string(&path).expect("Failed to read locale JSON");
        let val: Value = serde_json::from_str(&content).expect("Invalid JSON in locale file");
        collect_keys("", &val, &mut entries, &mut seen_variants);
    }

    let mut code = String::from(
        "#[allow(dead_code)]\n#[derive(Debug, Clone, Copy, PartialEq, Eq)]\npub enum LocaleKey {\n",
    );
    for (variant, _) in &entries {
        code.push_str(&format!("    {variant},\n"));
    }
    code.push_str("}\n\n#[allow(dead_code)]\nimpl LocaleKey {\n    pub const fn as_str(&self) -> &'static str {\n        match self {\n");
    for (variant, key) in &entries {
        code.push_str(&format!("            LocaleKey::{variant} => \"{key}\",\n"));
    }
    code.push_str("        }\n    }\n}\n\n#[allow(dead_code)]\npub const ALL_LOCALE_KEYS: &[LocaleKey] = &[\n");
    for (variant, _) in &entries {
        code.push_str(&format!("    LocaleKey::{variant},\n"));
    }
    code.push_str("];\n");

    let out_dir = env::var("OUT_DIR").unwrap();
    fs::write(Path::new(&out_dir).join("locale_keys.rs"), code)
        .expect("Failed to write locale_keys.rs");
}

fn collect_keys(
    prefix: &str,
    val: &Value,
    out: &mut Vec<(String, String)>,
    seen: &mut HashSet<String>,
) {
    match val {
        Value::Object(map) => {
            let mut keys: Vec<_> = map.keys().collect();
            keys.sort();
            for k in keys {
                let next = if prefix.is_empty() {
                    k.clone()
                } else {
                    format!("{prefix}.{k}")
                };
                collect_keys(&next, &map[k], out, seen);
            }
        }
        Value::String(_) => {
            let variant = to_pascal_case(prefix);
            if seen.insert(variant.clone()) {
                out.push((variant, prefix.to_string()));
            }
        }
        _ => {}
    }
}

fn to_pascal_case(dot_key: &str) -> String {
    let mut out = String::new();
    for segment in dot_key.split(['.', '_', '-']) {
        let mut chars = segment.chars();
        if let Some(first) = chars.next() {
            out.push(first.to_ascii_uppercase());
            out.push_str(chars.as_str());
        }
    }
    out
}
