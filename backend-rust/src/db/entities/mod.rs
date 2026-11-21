pub mod ai;
pub mod app;
pub mod book;
pub mod content_report;
pub mod course;
pub mod education;
pub mod exam;
pub mod users;

pub use ai::{ai_api_logs, ai_models};
pub use app::{app_event_history, app_tier, app_version};
pub use book::{
    book_category, book_event_stats, book_group, book_group_stats, book_interactions, books,
};
pub use course::{
    course_chapters, course_enrollments, course_lecture_texts, course_lectures, course_stats,
    course_user_progress, course_user_stats_category, course_user_stats_global, courses,
};
pub use education::{education_categories, education_grades, education_tags};
pub use users::{
    users_accounts, users_profiles, users_sessions, users_stats, users_verifications,
};
