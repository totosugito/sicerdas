use crate::config::AppConfig;
use serde::Serialize;

#[derive(Serialize)]
struct ResendEmailPayload<'a> {
    from: String,
    to: Vec<&'a str>,
    subject: &'a str,
    html: String,
}

pub async fn send_resend_email(
    http: &reqwest::Client,
    config: &AppConfig,
    to_email: &str,
    subject: &str,
    html: String,
) -> Result<(), String> {
    let Some(api_key) = config.resend_api_key.as_deref() else {
        tracing::warn!("RESEND_API_KEY not configured; skipping email to {to_email}");
        return Ok(());
    };

    let from = format!("{} <{}>", config.no_reply_email_name, config.no_reply_email);
    let payload = ResendEmailPayload {
        from,
        to: vec![to_email],
        subject,
        html,
    };

    let res = http
        .post("https://api.resend.com/emails")
        .bearer_auth(api_key)
        .json(&payload)
        .send()
        .await
        .map_err(|e| format!("Resend request error: {e}"))?;

    if !res.status().is_success() {
        let status = res.status();
        let body = res.text().await.unwrap_or_default();
        return Err(format!("Resend API failed ({status}): {body}"));
    }

    Ok(())
}

pub fn render_reset_otp_email(email: &str, otp: &str) -> String {
    let template = include_str!("../../../backend/src/templates/reset-password-otp.html");
    let name = email.split('@').next().unwrap_or(email);
    let year = chrono::Utc::now().format("%Y").to_string();
    template
        .replace("{{name}}", name)
        .replace("{{email}}", email)
        .replace("{{otp}}", otp)
        .replace("{{year}}", &year)
}
