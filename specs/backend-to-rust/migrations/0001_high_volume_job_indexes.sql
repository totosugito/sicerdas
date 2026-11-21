-- High-volume indexes for backend-rust daily scheduled jobs (safe/idempotent)
CREATE INDEX IF NOT EXISTS app_event_history_content_created_idx
    ON app_event_history (content_type, created_at);

CREATE INDEX IF NOT EXISTS app_event_history_ref_created_idx
    ON app_event_history (reference_id, created_at);

CREATE INDEX IF NOT EXISTS exam_sessions_status_updated_idx
    ON exam_sessions (status, updated_at);

CREATE INDEX IF NOT EXISTS exam_sessions_purged_created_idx
    ON exam_sessions (is_answers_purged, created_at);

CREATE INDEX IF NOT EXISTS exam_sessions_updated_at_idx
    ON exam_sessions (updated_at);

CREATE INDEX IF NOT EXISTS exam_package_interactions_updated_at_idx
    ON exam_package_interactions (updated_at);

CREATE INDEX IF NOT EXISTS book_interactions_updated_at_idx
    ON book_interactions (updated_at);

CREATE INDEX IF NOT EXISTS users_sessions_created_user_idx
    ON users_sessions (created_at, user_id);
