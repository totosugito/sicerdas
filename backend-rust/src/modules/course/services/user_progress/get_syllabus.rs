use crate::app::AppState;
use crate::db::entities::app_version::ContentStatus;
use crate::db::entities::course_lectures::LectureType;
use crate::db::entities::{course_chapters, course_lectures, course_user_progress, courses};
use crate::error::AppError;
use crate::locales::{self, Lang, LocaleKey};
use crate::modules::course::types::{
    ChapterProgressItem, LectureProgressItem, SyllabusData,
};
use sea_orm::{
    ColumnTrait, DbBackend, EntityTrait, FromQueryResult, QueryFilter, QueryOrder, Statement, Value,
};
use std::collections::HashMap;
use uuid::Uuid;

#[derive(Debug, FromQueryResult)]
struct SectionPackageRow {
    id: Uuid,
    package_id: Uuid,
}

pub async fn get_syllabus(
    state: &AppState,
    lang: Lang,
    course_id: Uuid,
    user_id: Uuid,
) -> Result<SyllabusData, AppError> {
    let course = courses::Entity::find()
        .filter(courses::Column::Id.eq(course_id))
        .filter(courses::Column::Status.eq(ContentStatus::Published))
        .one(&state.db)
        .await?;

    if course.is_none() {
        return Err(AppError::NotFound(locales::translate(
            lang,
            LocaleKey::CourseCoursesNotFound,
        )));
    }

    let chapters = course_chapters::Entity::find()
        .filter(course_chapters::Column::CourseId.eq(course_id))
        .filter(course_chapters::Column::IsActive.eq(true))
        .order_by_asc(course_chapters::Column::Position)
        .all(&state.db)
        .await?;

    if chapters.is_empty() {
        return Ok(SyllabusData {
            course_id,
            total_lectures: 0,
            completed_lectures: 0,
            progress_percentage: 0,
            chapters: Vec::new(),
        });
    }

    let chapter_ids: Vec<Uuid> = chapters.iter().map(|c| c.id).collect();
    let lectures = course_lectures::Entity::find()
        .filter(course_lectures::Column::ChapterId.is_in(chapter_ids))
        .filter(course_lectures::Column::IsActive.eq(true))
        .order_by_asc(course_lectures::Column::Position)
        .all(&state.db)
        .await?;

    let exam_section_ids: Vec<Uuid> = lectures
        .iter()
        .filter(|l| l.r#type == LectureType::Exam)
        .filter_map(|l| l.reference_url.as_deref())
        .filter_map(|s| Uuid::parse_str(s).ok())
        .collect();

    let mut package_by_section_id: HashMap<String, Uuid> = HashMap::new();
    if !exam_section_ids.is_empty() {
        let mut values: Vec<Value> = Vec::with_capacity(exam_section_ids.len());
        let placeholders: Vec<String> = exam_section_ids
            .into_iter()
            .map(|id| {
                values.push(id.into());
                format!("${}", values.len())
            })
            .collect();
        let sql = format!(
            "SELECT id, package_id FROM exam_package_sections WHERE id IN ({})",
            placeholders.join(", ")
        );
        let section_rows = SectionPackageRow::find_by_statement(Statement::from_sql_and_values(
            DbBackend::Postgres,
            &sql,
            values,
        ))
        .all(&state.db)
        .await?;

        for row in section_rows {
            package_by_section_id.insert(row.id.to_string(), row.package_id);
        }
    }

    let progress_records = course_user_progress::Entity::find()
        .filter(course_user_progress::Column::UserId.eq(user_id))
        .filter(course_user_progress::Column::CourseId.eq(course_id))
        .all(&state.db)
        .await?;

    let progress_map: HashMap<Uuid, course_user_progress::Model> = progress_records
        .into_iter()
        .map(|p| (p.lecture_id, p))
        .collect();

    let total_lectures = lectures.len();
    let mut completed_lectures = 0usize;

    let chapters_with_lectures = chapters
        .into_iter()
        .map(|ch| {
            let ch_lectures = lectures
                .iter()
                .filter(|l| l.chapter_id == ch.id)
                .map(|l| {
                    let prog = progress_map.get(&l.id);
                    let is_completed = prog.map(|p| p.is_completed).unwrap_or(false);
                    if is_completed {
                        completed_lectures += 1;
                    }
                    let package_id = l
                        .reference_url
                        .as_deref()
                        .and_then(|r| package_by_section_id.get(r).copied());

                    LectureProgressItem {
                        id: l.id,
                        title: l.title.clone(),
                        description: l.description.clone(),
                        chapter_id: l.chapter_id,
                        r#type: l.r#type.as_str().to_string(),
                        reference_url: l.reference_url.clone(),
                        extra: l.extra.clone().unwrap_or_else(|| serde_json::json!({})),
                        package_id,
                        position: l.position.to_string(),
                        is_completed,
                        watch_time_seconds: prog.map(|p| p.watch_time_seconds).unwrap_or(0),
                        completed_at: prog
                            .and_then(|p| p.completed_at)
                            .map(|d| d.to_rfc3339()),
                    }
                })
                .collect();

            ChapterProgressItem {
                id: ch.id,
                chapter_name: ch.chapter_name,
                course_id: ch.course_id,
                position: ch.position,
                lectures: ch_lectures,
            }
        })
        .collect();

    let progress_percentage = if total_lectures > 0 {
        ((completed_lectures as f64 / total_lectures as f64) * 100.0).round() as i64
    } else {
        0
    };

    Ok(SyllabusData {
        course_id,
        total_lectures,
        completed_lectures,
        progress_percentage,
        chapters: chapters_with_lectures,
    })
}
