use crate::app::AppState;
use crate::db::entities::exam::{exam_passages, exam_questions};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::exam::types::{QuestionResponseItem, UpdateQuestionBody};
use crate::modules::exam::utils::{
    parse_difficulty, parse_question_type, parse_scoring_strategy, sync_passage,
    sync_question_max_score,
};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, EntityTrait, Set, TransactionTrait};
use uuid::Uuid;

pub async fn update_question(
    state: &AppState,
    lang: Lang,
    id: Uuid,
    body: UpdateQuestionBody,
) -> Result<QuestionResponseItem, AppError> {
    let existing = exam_questions::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(
                lang,
                LocaleKey::ExamQuestionsUpdateNotFound,
            ))
        })?;

    let old_passage_id = existing.passage_id;
    let new_passage_id = body.passage_id.unwrap_or(old_passage_id);
    if let Some(pid) = new_passage_id {
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

    let scoring_changed = body.scoring_strategy.is_some();
    let txn = state.db.begin().await?;

    let mut active: exam_questions::ActiveModel = existing.into();
    if let Some(sid) = body.subject_id {
        active.subject_id = Set(sid);
    }
    if let Some(pid) = body.passage_id {
        active.passage_id = Set(pid);
    }
    if let Some(content) = body.content {
        active.content = Set(content);
    }
    if let Some(rc) = body.reason_content {
        active.reason_content = Set(Some(rc));
    }
    if let Some(diff) = body.difficulty {
        active.difficulty = Set(parse_difficulty(&diff));
    }
    if let Some(qt) = body.r#type {
        active.r#type = Set(parse_question_type(&qt));
    }
    if let Some(ss) = body.scoring_strategy {
        active.scoring_strategy = Set(parse_scoring_strategy(&ss));
    }
    if let Some(tier) = body.required_tier {
        active.required_tier = Set(Some(tier));
    }
    if let Some(gid) = body.education_grade_id {
        active.education_grade_id = Set(gid.filter(|&g| g != 0));
    }
    if let Some(is_active) = body.is_active {
        active.is_active = Set(is_active);
    }
    if let Some(vf) = body.variable_formulas {
        active.variable_formulas = Set(vf);
    }
    active.updated_at = Set(Utc::now().into());

    let updated = active.update(&txn).await?;

    if old_passage_id != updated.passage_id {
        if let Some(old_pid) = old_passage_id {
            sync_passage(&txn, old_pid).await?;
        }
        if let Some(new_pid) = updated.passage_id {
            sync_passage(&txn, new_pid).await?;
        }
    } else if let Some(pid) = updated.passage_id {
        sync_passage(&txn, pid).await?;
    }

    if scoring_changed {
        sync_question_max_score(&txn, updated.id).await?;
    }

    txn.commit().await?;

    Ok(QuestionResponseItem {
        id: updated.id,
        subject_id: updated.subject_id,
        passage_id: updated.passage_id,
        content: updated.content,
        reason_content: updated.reason_content.unwrap_or_else(|| serde_json::json!([])),
        difficulty: updated.difficulty.as_str().to_string(),
        r#type: updated.r#type.as_str().to_string(),
        max_score: updated.max_score,
        scoring_strategy: updated.scoring_strategy.as_str().to_string(),
        required_tier: updated.required_tier,
        education_grade_id: updated.education_grade_id,
        is_active: updated.is_active,
        variable_formulas: updated.variable_formulas,
        created_at: updated.created_at.to_rfc3339(),
        updated_at: updated.updated_at.to_rfc3339(),
        subject_name: None,
    })
}
