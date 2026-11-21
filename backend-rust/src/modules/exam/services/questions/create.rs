use crate::app::AppState;
use crate::db::entities::exam::{exam_passages, exam_questions, exam_subjects};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{CreateQuestionBody, QuestionResponseItem};
use crate::modules::exam::utils::{
    parse_difficulty, parse_question_type, parse_scoring_strategy, sync_passage,
};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set, TransactionTrait};
use uuid::Uuid;

pub async fn create_question(
    state: &AppState,
    lang: Lang,
    created_by_user_id: Uuid,
    body: CreateQuestionBody,
) -> Result<QuestionResponseItem, AppError> {
    let subject = exam_subjects::Entity::find_by_id(body.subject_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::BadRequest(locales::translate(
                lang,
                LocaleKey::ExamQuestionsCreateInvalidSubject,
            ))
        })?;

    if let Some(pid) = body.passage_id {
        let passage_exists = exam_passages::Entity::find_by_id(pid)
            .one(&state.db)
            .await?
            .is_some();
        if !passage_exists {
            return Err(AppError::BadRequest(locales::translate(
                lang,
                LocaleKey::ExamQuestionsCreateInvalidPassage,
            )));
        }
    }

    let now = Utc::now();
    let content = body.content.unwrap_or_else(|| serde_json::json!([]));
    let reason_content = body.reason_content.unwrap_or_else(|| serde_json::json!([]));
    let difficulty = parse_difficulty(body.difficulty.as_deref().unwrap_or("medium"));
    let q_type = parse_question_type(body.r#type.as_deref().unwrap_or("multiple_choice"));
    let scoring = parse_scoring_strategy(body.scoring_strategy.as_deref().unwrap_or("all_or_nothing"));
    let grade_id = body.education_grade_id.filter(|&g| g != 0);

    let txn = state.db.begin().await?;

    let active = exam_questions::ActiveModel {
        id: Set(Uuid::new_v4()),
        passage_id: Set(body.passage_id),
        subject_id: Set(body.subject_id),
        content: Set(content),
        reason_content: Set(Some(reason_content)),
        variable_formulas: Set(body.variable_formulas),
        difficulty: Set(difficulty),
        r#type: Set(q_type),
        max_score: Set(1),
        scoring_strategy: Set(scoring),
        required_tier: Set(Some(body.required_tier.unwrap_or_else(|| "free".to_string()))),
        education_grade_id: Set(grade_id),
        created_by_user_id: Set(Some(created_by_user_id)),
        is_active: Set(body.is_active.unwrap_or(true)),
        created_at: Set(now.into()),
        updated_at: Set(now.into()),
    };

    let created = active.insert(&txn).await?;
    if let Some(pid) = body.passage_id {
        sync_passage(&txn, pid).await?;
    }
    txn.commit().await?;

    Ok(QuestionResponseItem {
        id: created.id,
        subject_id: created.subject_id,
        passage_id: created.passage_id,
        content: created.content,
        reason_content: created.reason_content.unwrap_or_else(|| serde_json::json!([])),
        difficulty: created.difficulty.as_str().to_string(),
        r#type: created.r#type.as_str().to_string(),
        max_score: created.max_score,
        scoring_strategy: created.scoring_strategy.as_str().to_string(),
        required_tier: created.required_tier,
        education_grade_id: created.education_grade_id,
        is_active: created.is_active,
        variable_formulas: created.variable_formulas,
        created_at: created.created_at.to_rfc3339(),
        updated_at: created.updated_at.to_rfc3339(),
        subject_name: Some(subject.name),
    })
}
