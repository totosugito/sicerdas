use crate::app::AppState;
use crate::db::entities::course_lectures::LectureType;
use crate::db::entities::{
    course_chapters, course_enrollments, course_lectures, course_user_progress, courses,
};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::CompleteLectureData;
use chrono::Utc;
use sea_orm::{
    ActiveModelTrait, ColumnTrait, ConnectionTrait, DbBackend, EntityTrait, FromQueryResult,
    QueryFilter, Set, Statement, TransactionTrait,
};
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct ExamSessionScoreRow {
    score: Option<f64>,
}

pub async fn complete_lecture(
    state: &AppState,
    lang: Lang,
    lecture_id: Uuid,
    user_id: Uuid,
) -> Result<CompleteLectureData, AppError> {
    let lecture = course_lectures::Entity::find()
        .filter(course_lectures::Column::Id.eq(lecture_id))
        .filter(course_lectures::Column::IsActive.eq(true))
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseLecturesNotFound))
        })?;

    let chapter = course_chapters::Entity::find_by_id(lecture.chapter_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseChaptersNotFound))
        })?;

    let course_id = chapter.course_id;
    let course = courses::Entity::find_by_id(course_id)
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::NotFound(locales::translate(lang, LocaleKey::CourseCoursesNotFound))
        })?;

    let enrollment = course_enrollments::Entity::find()
        .filter(course_enrollments::Column::UserId.eq(user_id))
        .filter(course_enrollments::Column::CourseId.eq(course_id))
        .one(&state.db)
        .await?
        .ok_or_else(|| AppError::Forbidden(locales::translate(lang, LocaleKey::AuthForbidden)))?;

    let mut exam_score: Option<f64> = None;
    let passed = true;

    if lecture.r#type == LectureType::Exam {
        let section_id_str = lecture
            .reference_url
            .as_deref()
            .ok_or_else(|| AppError::BadRequest("Invalid exam section referenceUrl".to_string()))?;
        let section_id = Uuid::parse_str(section_id_str)
            .map_err(|_| AppError::BadRequest("Invalid exam section UUID".to_string()))?;

        let last_session = ExamSessionScoreRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            r#"
            SELECT score::float8 AS score
            FROM exam_sessions
            WHERE user_id = $1 AND section_id = $2 AND status = 'completed'::exam_session_status
            ORDER BY end_time DESC NULLS LAST
            LIMIT 1
            "#,
            vec![user_id.into(), section_id.into()],
        ))
        .one(&state.db)
        .await?
        .ok_or_else(|| {
            AppError::BadRequest(locales::translate(lang, LocaleKey::CourseLecturesNotFound))
        })?;

        let score_val = last_session.score.unwrap_or(0.0);
        exam_score = Some(score_val);
        let threshold = lecture
            .extra
            .as_ref()
            .and_then(|e| e.get("successThreshold"))
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0);

        if score_val < threshold {
            return Err(AppError::BadRequest(locales::translate(
                lang,
                LocaleKey::CourseLecturesNotFound,
            )));
        }
    }

    let now = Utc::now();
    let txn = state.db.begin().await?;

    let existing_progress = course_user_progress::Entity::find()
        .filter(course_user_progress::Column::UserId.eq(user_id))
        .filter(course_user_progress::Column::CourseId.eq(course_id))
        .filter(course_user_progress::Column::LectureId.eq(lecture_id))
        .one(&txn)
        .await?;

    let was_already_completed = existing_progress
        .as_ref()
        .map(|p| p.is_completed)
        .unwrap_or(false);

    if let Some(prog) = existing_progress {
        let mut active: course_user_progress::ActiveModel = prog.into();
        active.is_completed = Set(true);
        active.completed_at = Set(Some(now.into()));
        active.updated_at = Set(now.into());
        active.update(&txn).await?;
    } else {
        let active = course_user_progress::ActiveModel {
            id: Set(Uuid::new_v4()),
            user_id: Set(user_id),
            course_id: Set(course_id),
            lecture_id: Set(lecture_id),
            watch_time_seconds: Set(0),
            is_completed: Set(true),
            completed_at: Set(Some(now.into())),
            updated_at: Set(now.into()),
        };
        active.insert(&txn).await?;
    }

    if !was_already_completed {
        let active_chapters = course_chapters::Entity::find()
            .filter(course_chapters::Column::CourseId.eq(course_id))
            .filter(course_chapters::Column::IsActive.eq(true))
            .all(&txn)
            .await?;
        let chapter_ids: Vec<Uuid> = active_chapters.into_iter().map(|c| c.id).collect();

        let total_lectures = if chapter_ids.is_empty() {
            0usize
        } else {
            course_lectures::Entity::find()
                .filter(course_lectures::Column::ChapterId.is_in(chapter_ids))
                .filter(course_lectures::Column::IsActive.eq(true))
                .all(&txn)
                .await?
                .len()
        };

        let completed_count = course_user_progress::Entity::find()
            .filter(course_user_progress::Column::UserId.eq(user_id))
            .filter(course_user_progress::Column::CourseId.eq(course_id))
            .filter(course_user_progress::Column::IsCompleted.eq(true))
            .all(&txn)
            .await?
            .len();

        if total_lectures > 0 && completed_count >= total_lectures {
            txn.execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                "UPDATE course_enrollments SET status = 'completed'::enrollment_status, completed_at = NOW() WHERE id = $1",
                vec![enrollment.id.into()],
            ))
            .await?;

            txn.execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                r#"
                INSERT INTO course_user_stats_global (user_id, total_courses_enrolled, total_courses_completed, total_lectures_completed, last_active_at, updated_at)
                VALUES ($1, 1, 1, 1, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE
                SET total_courses_completed = course_user_stats_global.total_courses_completed + 1,
                    total_lectures_completed = course_user_stats_global.total_lectures_completed + 1,
                    last_active_at = NOW(),
                    updated_at = NOW()
                "#,
                vec![user_id.into()],
            ))
            .await?;

            txn.execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                r#"
                INSERT INTO course_user_stats_category (id, user_id, category_id, courses_enrolled, courses_completed, updated_at)
                VALUES ($1, $2, $3, 0, 1, NOW())
                ON CONFLICT (user_id, category_id) DO UPDATE
                SET courses_completed = course_user_stats_category.courses_completed + 1,
                    updated_at = NOW()
                "#,
                vec![Uuid::new_v4().into(), user_id.into(), course.category_id.into()],
            ))
            .await?;
        } else {
            txn.execute(Statement::from_sql_and_values(
                DbBackend::Postgres,
                r#"
                INSERT INTO course_user_stats_global (user_id, total_courses_enrolled, total_courses_completed, total_lectures_completed, last_active_at, updated_at)
                VALUES ($1, 1, 0, 1, NOW(), NOW())
                ON CONFLICT (user_id) DO UPDATE
                SET total_lectures_completed = course_user_stats_global.total_lectures_completed + 1,
                    last_active_at = NOW(),
                    updated_at = NOW()
                "#,
                vec![user_id.into()],
            ))
            .await?;
        }
    }

    txn.commit().await?;

    Ok(CompleteLectureData {
        lecture_id,
        course_id,
        is_completed: true,
        completed_at: now.to_rfc3339(),
        score: exam_score,
        passed,
    })
}
