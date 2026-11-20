pub mod avatar;
pub mod change_password;
pub mod details;
pub mod multi_session_revoke;
pub mod revoke_other_sessions;
pub mod sessions_list;
pub mod update_profile;

use crate::app::AppState;
use axum::{
    routing::{get, patch, post, put},
    Router,
};

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/details", get(details::handler))
        .route("/update-profile", put(update_profile::handler))
        .route("/avatar", patch(avatar::handler))
        .route("/change-password", put(change_password::handler))
        .route("/sessions-list", get(sessions_list::handler))
        .route(
            "/revoke-other-sessions-v1",
            post(revoke_other_sessions::handler),
        )
        .route("/multi-session-revoke", post(multi_session_revoke::handler))
}
