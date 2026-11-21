use crate::app::AppState;
use crate::db::entities::exam::enums::{ExamSessionMode, ExamSessionStatus};
use crate::db::entities::exam::{exam_question_options, exam_session_answers, exam_sessions};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{SaveAnswerBody, SaveAnswerData};
use chrono::Utc;
use sea_orm::{ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set};
use uuid::Uuid;

pub async fn save_answer(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: SaveAnswerBody,
) -> Result<SaveAnswerData, AppError> {
    let session = exam_sessions::Entity::find_by_id(body.session_id)
        .filter(exam_sessions::Column::UserId.eq(user_id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsSaveAnswerNotFound)))?;

    if session.status != ExamSessionStatus::InProgress {
        return Err(AppError::Forbidden(translate(
            lang,
            LocaleKey::ExamSessionsSaveAnswerFinished,
        )));
    }

    let now = Utc::now().fixed_offset();
    let mut sess_active: exam_sessions::ActiveModel = session.clone().into();
    sess_active.elapsed_seconds = Set(body.elapsed_seconds);
    sess_active.updated_at = Set(now);
    sess_active
        .update(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let existing_ans = exam_session_answers::Entity::find()
        .filter(exam_session_answers::Column::SessionId.eq(body.session_id))
        .filter(exam_session_answers::Column::QuestionId.eq(body.question_id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsErrorsNotFound)))?;

    if session.mode == ExamSessionMode::Study && existing_ans.selected_option_id.is_some() {
        return Err(AppError::Forbidden(translate(
            lang,
            LocaleKey::ExamSessionsSaveAnswerStudyLocked,
        )));
    }

    let mut ans_active: exam_session_answers::ActiveModel = existing_ans.into();
    if let Some(opt_id) = body.selected_option_id {
        ans_active.selected_option_id = Set(Some(opt_id));
        if session.mode == ExamSessionMode::Study {
            if let Some(opt) = exam_question_options::Entity::find_by_id(opt_id)
                .one(&state.db)
                .await
                .map_err(|e| AppError::Internal(e.to_string()))?
            {
                ans_active.is_correct = Set(Some(opt.is_correct));
            }
        }
    }
    if let Some(text_ans) = body.text_answer {
        ans_active.text_answer = Set(Some(serde_json::Value::Array(text_ans)));
    }
    if let Some(doubtful) = body.is_doubtful {
        ans_active.is_doubtful = Set(doubtful);
    }
    ans_active.updated_at = Set(now);
    ans_active
        .update(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(SaveAnswerData {
        session_id: body.session_id,
        question_id: body.question_id,
    })
}
