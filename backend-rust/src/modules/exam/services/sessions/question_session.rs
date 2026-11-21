use crate::app::AppState;
use crate::db::entities::exam::enums::{ExamSessionMode, ExamSessionStatus};
use crate::db::entities::exam::{
    exam_passages, exam_question_options, exam_question_solutions, exam_questions,
    exam_session_answers, exam_sessions,
};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{
    SessionEvaluationInfo, SessionOptionInfo, SessionPassageInfo, SessionQuestionData,
    SessionQuestionInfo, SessionSolutionInfo,
};
use crate::modules::exam::utils::blocknote_to_html;
use sea_orm::{ActiveEnum, ColumnTrait, EntityTrait, QueryFilter, QueryOrder};
use uuid::Uuid;

pub async fn question_session(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    session_id: Uuid,
    question_id: Uuid,
) -> Result<SessionQuestionData, AppError> {
    let session = exam_sessions::Entity::find_by_id(session_id)
        .filter(exam_sessions::Column::UserId.eq(user_id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsErrorsNotFound)))?;

    let answer_record = exam_session_answers::Entity::find()
        .filter(exam_session_answers::Column::SessionId.eq(session_id))
        .filter(exam_session_answers::Column::QuestionId.eq(question_id))
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsErrorsNotFound)))?;

    let question = exam_questions::Entity::find_by_id(question_id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamSessionsErrorsNotFound)))?;

    let passage = if let Some(pid) = question.passage_id {
        if let Some(p) = exam_passages::Entity::find_by_id(pid)
            .one(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?
        {
            Some(SessionPassageInfo {
                id: p.id,
                title: p.title,
                html_content: blocknote_to_html(state, &p.content),
            })
        } else {
            None
        }
    } else {
        None
    };

    let options_raw = exam_question_options::Entity::find()
        .filter(exam_question_options::Column::QuestionId.eq(question_id))
        .order_by_asc(exam_question_options::Column::Order)
        .all(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let ordered_options = if let Some(shuffled_ids) = answer_record
        .shuffled_options_order
        .as_ref()
        .and_then(|v| v.as_array())
    {
        let mut out = Vec::new();
        for id_val in shuffled_ids {
            if let Some(id_str) = id_val.as_str() {
                if let Ok(opt_uuid) = Uuid::parse_str(id_str) {
                    if let Some(opt) = options_raw.iter().find(|o| o.id == opt_uuid) {
                        out.push(SessionOptionInfo {
                            id: opt.id,
                            html_content: blocknote_to_html(state, &opt.content),
                        });
                    }
                }
            }
        }
        if out.is_empty() {
            options_raw
                .iter()
                .map(|opt| SessionOptionInfo {
                    id: opt.id,
                    html_content: blocknote_to_html(state, &opt.content),
                })
                .collect()
        } else {
            out
        }
    } else {
        options_raw
            .iter()
            .map(|opt| SessionOptionInfo {
                id: opt.id,
                html_content: blocknote_to_html(state, &opt.content),
            })
            .collect()
    };

    let is_answered =
        answer_record.selected_option_id.is_some() || answer_record.text_answer.is_some();
    let should_evaluate = session.status == ExamSessionStatus::Completed
        || (session.mode == ExamSessionMode::Study && is_answered);

    let evaluation = if should_evaluate {
        let solutions_raw = exam_question_solutions::Entity::find()
            .filter(exam_question_solutions::Column::QuestionId.eq(question_id))
            .order_by_asc(exam_question_solutions::Column::Order)
            .all(&state.db)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        let correct_option_id = options_raw.iter().find(|o| o.is_correct).map(|o| o.id);

        Some(SessionEvaluationInfo {
            is_correct: answer_record.is_correct,
            correct_option_id,
            solutions: solutions_raw
                .into_iter()
                .map(|s| SessionSolutionInfo {
                    id: s.id,
                    title: s.title,
                    solution_type: s.solution_type.into_value().to_string().trim_matches('\'').to_string(),
                    html_content: blocknote_to_html(state, &s.content),
                })
                .collect(),
        })
    } else {
        None
    };

    Ok(SessionQuestionData {
        question: SessionQuestionInfo {
            id: question.id,
            r#type: question.r#type.into_value().to_string().trim_matches('\'').to_string(),
            html_content: blocknote_to_html(state, &question.content),
        },
        passage,
        options: ordered_options,
        evaluation,
        selected_option_id: answer_record.selected_option_id,
        text_answer: answer_record.text_answer,
    })
}
