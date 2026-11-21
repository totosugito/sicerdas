use crate::app::AppState;
use crate::db::entities::exam::enums::{
    DifficultyLevel, ExamSessionMode, ExamType, QuestionType, ScoringStrategy, SolutionType,
};
use crate::db::entities::exam::exam_questions;
use crate::error::AppError;
use chrono::{DateTime, Datelike, Utc};
use sea_orm::{
    ConnectionTrait, DbBackend, EntityTrait, FromQueryResult, Statement,
};
use uuid::Uuid;

pub fn get_package_thumbnail_url(
    state: &AppState,
    thumbnail_path: Option<&str>,
) -> Option<String> {
    let path = thumbnail_path?.trim();
    if path.is_empty() {
        return None;
    }
    if path.starts_with("http://") || path.starts_with("https://") {
        return Some(path.to_string());
    }
    Some(state.storage.public_url(path))
}

pub fn build_package_thumbnail_rel_path(
    package_id: Uuid,
    created_at: DateTime<Utc>,
    filename: &str,
) -> String {
    format!(
        "exam-package/{:04}-{:02}/{}/{}",
        created_at.year(),
        created_at.month(),
        package_id,
        filename
    )
}

pub fn parse_difficulty(s: &str) -> DifficultyLevel {
    match s.to_lowercase().as_str() {
        "easy" => DifficultyLevel::Easy,
        "hard" => DifficultyLevel::Hard,
        _ => DifficultyLevel::Medium,
    }
}

pub fn parse_question_type(s: &str) -> QuestionType {
    match s.to_lowercase().as_str() {
        "multiple_select" => QuestionType::MultipleSelect,
        "essay" => QuestionType::Essay,
        "statement_reasoning" => QuestionType::StatementReasoning,
        _ => QuestionType::MultipleChoice,
    }
}

pub fn parse_scoring_strategy(s: &str) -> ScoringStrategy {
    match s.to_lowercase().as_str() {
        "partial" => ScoringStrategy::Partial,
        "partial_with_penalty" => ScoringStrategy::PartialWithPenalty,
        _ => ScoringStrategy::AllOrNothing,
    }
}

pub fn parse_solution_type(s: &str) -> SolutionType {
    match s.to_lowercase().as_str() {
        "fast_method" => SolutionType::FastMethod,
        "video_link" => SolutionType::VideoLink,
        "tips" => SolutionType::Tips,
        _ => SolutionType::General,
    }
}

pub fn parse_exam_type(s: &str) -> ExamType {
    match s.to_lowercase().as_str() {
        "custom_practice" => ExamType::CustomPractice,
        "course_exam" => ExamType::CourseExam,
        _ => ExamType::Official,
    }
}

pub fn parse_session_mode(s: &str) -> ExamSessionMode {
    match s.to_lowercase().as_str() {
        "study" => ExamSessionMode::Study,
        _ => ExamSessionMode::Tryout,
    }
}

pub async fn sync_passage<C: ConnectionTrait>(
    conn: &C,
    passage_id: Uuid,
) -> Result<(), AppError> {
    conn.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        UPDATE exam_passages
        SET
            total_questions = COALESCE((SELECT COUNT(*)::int FROM exam_questions WHERE passage_id = $1), 0),
            active_questions = COALESCE((SELECT COUNT(*)::int FROM exam_questions WHERE passage_id = $1 AND is_active = true), 0),
            updated_at = NOW()
        WHERE id = $1
        "#,
        vec![passage_id.into()],
    ))
    .await?;
    Ok(())
}

pub async fn sync_section<C: ConnectionTrait>(
    conn: &C,
    section_id: Uuid,
) -> Result<(), AppError> {
    conn.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        UPDATE exam_package_sections
        SET
            total_questions = COALESCE((
                SELECT COUNT(*)::int
                FROM exam_package_questions epq
                INNER JOIN exam_questions eq ON epq.question_id = eq.id
                WHERE epq.section_id = $1
            ), 0),
            active_questions = COALESCE((
                SELECT COUNT(*)::int
                FROM exam_package_questions epq
                INNER JOIN exam_questions eq ON epq.question_id = eq.id
                WHERE epq.section_id = $1 AND eq.is_active = true
            ), 0),
            max_score = COALESCE((
                SELECT SUM(eq.max_score)::int
                FROM exam_package_questions epq
                INNER JOIN exam_questions eq ON epq.question_id = eq.id
                WHERE epq.section_id = $1
            ), 0),
            updated_at = NOW()
        WHERE id = $1
        "#,
        vec![section_id.into()],
    ))
    .await?;
    Ok(())
}

pub async fn sync_package<C: ConnectionTrait>(
    conn: &C,
    package_id: Uuid,
) -> Result<(), AppError> {
    conn.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        r#"
        UPDATE exam_packages
        SET
            total_questions = COALESCE((
                SELECT COUNT(*)::int
                FROM exam_package_questions epq
                INNER JOIN exam_questions eq ON epq.question_id = eq.id
                WHERE epq.package_id = $1
            ), 0),
            active_questions = COALESCE((
                SELECT COUNT(*)::int
                FROM exam_package_questions epq
                INNER JOIN exam_questions eq ON epq.question_id = eq.id
                WHERE epq.package_id = $1 AND eq.is_active = true
            ), 0),
            total_sections = COALESCE((
                SELECT COUNT(*)::int FROM exam_package_sections WHERE package_id = $1
            ), 0),
            active_sections = COALESCE((
                SELECT COUNT(*)::int FROM exam_package_sections WHERE package_id = $1 AND is_active = true
            ), 0),
            updated_at = NOW()
        WHERE id = $1
        "#,
        vec![package_id.into()],
    ))
    .await?;
    Ok(())
}

#[derive(Debug, FromQueryResult)]
struct ScoreRow {
    val: Option<i64>,
}

#[derive(Debug, FromQueryResult)]
struct SectionIdRow {
    section_id: Uuid,
}

pub async fn sync_question_max_score<C: ConnectionTrait>(
    conn: &C,
    question_id: Uuid,
) -> Result<(), AppError> {
    let Some(q) = exam_questions::Entity::find_by_id(question_id)
        .one(conn)
        .await?
    else {
        return Ok(());
    };

    let sql = match q.scoring_strategy {
        ScoringStrategy::Partial | ScoringStrategy::PartialWithPenalty => {
            "SELECT COALESCE(SUM(score), 0)::bigint AS val FROM exam_question_options WHERE question_id = $1 AND is_correct = true"
        }
        ScoringStrategy::AllOrNothing => {
            "SELECT COALESCE(MAX(score), 0)::bigint AS val FROM exam_question_options WHERE question_id = $1"
        }
    };

    let raw_max = ScoreRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        sql,
        vec![question_id.into()],
    ))
    .one(conn)
    .await?
    .and_then(|r| r.val)
    .unwrap_or(0);

    let max_score = if raw_max <= 0 { 1 } else { raw_max as i32 };

    conn.execute(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "UPDATE exam_questions SET max_score = $1, updated_at = NOW() WHERE id = $2",
        vec![max_score.into(), question_id.into()],
    ))
    .await?;

    let sections = SectionIdRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT section_id FROM exam_package_questions WHERE question_id = $1",
        vec![question_id.into()],
    ))
    .all(conn)
    .await?;

    for s in sections {
        sync_section(conn, s.section_id).await?;
    }

    Ok(())
}


pub async fn get_latest_exam_version_id(state: &AppState) -> Option<i32> {
    const CACHE_KEY: &str = "latest_version:exam";
    if let Some(cached) = state.read_cache.get(CACHE_KEY).await {
        if let Some(id) = cached.as_i64() {
            return Some(id as i32);
        }
        if cached.is_null() {
            return None;
        }
    }
    #[derive(Debug, FromQueryResult)]
    struct VerRow {
        id: i32,
    }
    let row = VerRow::find_by_statement(Statement::from_sql_and_values(
        DbBackend::Postgres,
        "SELECT id FROM app_versions WHERE data_type = 'exam' AND status = 'published' ORDER BY db_version DESC LIMIT 1",
        vec![],
    ))
    .one(&state.db)
    .await
    .ok()
    .flatten();
    let val = row.map(|r| r.id);
    let cache_val = match val {
        Some(v) => serde_json::json!(v),
        None => serde_json::Value::Null,
    };
    state.read_cache.insert(CACHE_KEY.to_string(), cache_val).await;
    val
}


pub fn blocknote_to_html(state: &AppState, blocks: &serde_json::Value) -> String {
    let Some(arr) = blocks.as_array() else {
        return String::new();
    };
    let mut out = String::new();
    for block in arr {
        let btype = block
            .get("type")
            .and_then(|v| v.as_str())
            .unwrap_or("paragraph");
        let mut text = String::new();
        if let Some(content) = block.get("content").and_then(|v| v.as_array()) {
            for inline in content {
                if let Some(t) = inline.get("text").and_then(|v| v.as_str()) {
                    text.push_str(t);
                } else if inline.get("type").and_then(|v| v.as_str()) == Some("inlineMath") {
                    if let Some(formula) = inline
                        .get("props")
                        .and_then(|p| p.get("formula"))
                        .and_then(|f| f.as_str())
                    {
                        text.push_str(&format!("${formula}$"));
                    }
                }
            }
        }
        match btype {
            "heading" => {
                let level = block
                    .get("props")
                    .and_then(|p| p.get("level"))
                    .and_then(|l| l.as_u64())
                    .unwrap_or(2)
                    .clamp(1, 6);
                out.push_str(&format!("<h{level}>{text}</h{level}>"));
            }
            "bulletListItem" | "numberedListItem" => {
                out.push_str(&format!("<li>{text}</li>"));
            }
            "image" => {
                if let Some(url) = block
                    .get("props")
                    .and_then(|p| p.get("url"))
                    .and_then(|u| u.as_str())
                {
                    let resolved = if url.starts_with("http://") || url.starts_with("https://") {
                        url.to_string()
                    } else {
                        state.storage.public_url(url)
                    };
                    out.push_str(&format!("<img src=\"{resolved}\" alt=\"\" />"));
                }
            }
            _ => {
                out.push_str(&format!("<p>{text}</p>"));
            }
        }
    }
    out
}
