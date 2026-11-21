use crate::app::AppState;
use crate::db::entities::exam::{exam_package_questions, exam_package_sections, exam_packages};
use crate::error::AppError;
use crate::locales::{translate, Lang, LocaleKey};
use crate::modules::exam::types::{ClonePackageBody, ClonePackageData};
use crate::modules::exam::utils::parse_exam_type;
use chrono::Utc;
use sea_orm::{ActiveEnum, ActiveModelTrait, ColumnTrait, EntityTrait, QueryFilter, Set, TransactionTrait};
use uuid::Uuid;

pub async fn admin_clone_package(
    state: &AppState,
    lang: Lang,
    user_id: Uuid,
    body: ClonePackageBody,
) -> Result<ClonePackageData, AppError> {
    let source_package = exam_packages::Entity::find_by_id(body.source_package_id)
        .one(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?
        .ok_or_else(|| AppError::NotFound(translate(lang, LocaleKey::ExamPackagesDeleteNotFound)))?;

    if source_package.exam_type == crate::db::entities::exam::enums::ExamType::CourseExam {
        return Err(AppError::BadRequest(translate(lang, LocaleKey::ExamPackagesCloneCannotCloneCloned)));
    }

    let source_sections = exam_package_sections::Entity::find()
        .filter(exam_package_sections::Column::PackageId.eq(body.source_package_id))
        .all(&state.db)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let txn = state
        .db
        .begin()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    let now = Utc::now().fixed_offset();
    let new_title = body
        .title
        .filter(|t| !t.trim().is_empty())
        .unwrap_or_else(|| format!("Cloned - {}", source_package.title));
    let new_exam_type = body
        .exam_type
        .as_deref()
        .map(parse_exam_type)
        .unwrap_or(source_package.exam_type.clone());

    let new_pkg = exam_packages::ActiveModel {
        id: Set(Uuid::new_v4()),
        category_id: Set(source_package.category_id),
        title: Set(new_title),
        exam_type: Set(new_exam_type),
        created_by_user_id: Set(Some(user_id)),
        duration_minutes: Set(source_package.duration_minutes),
        description: Set(source_package.description.clone()),
        required_tier: Set(source_package.required_tier.clone()),
        education_grade_id: Set(source_package.education_grade_id),
        is_active: Set(source_package.is_active),
        version_id: Set(source_package.version_id),
        thumbnail: Set(source_package.thumbnail.clone()),
        parent_package_id: Set(Some(body.source_package_id)),
        total_sections: Set(source_package.total_sections),
        active_sections: Set(source_package.active_sections),
        total_questions: Set(source_package.total_questions),
        active_questions: Set(source_package.active_questions),
        created_at: Set(now),
        updated_at: Set(now),
    }
    .insert(&txn)
    .await
    .map_err(|e| AppError::Internal(e.to_string()))?;

    for section in source_sections {
        let new_sec = exam_package_sections::ActiveModel {
            id: Set(Uuid::new_v4()),
            package_id: Set(new_pkg.id),
            group_name: Set(section.group_name.clone()),
            title: Set(section.title.clone()),
            description: Set(section.description.clone()),
            duration_minutes: Set(section.duration_minutes),
            order: Set(section.order),
            is_active: Set(section.is_active),
            created_by_user_id: Set(Some(user_id)),
            question_limit: Set(section.question_limit),
            is_random_item: Set(section.is_random_item),
            is_random_choice: Set(section.is_random_choice),
            max_score: Set(section.max_score),
            version_id: Set(section.version_id),
            total_questions: Set(section.total_questions),
            active_questions: Set(section.active_questions),
            created_at: Set(now),
            updated_at: Set(now),
        }
        .insert(&txn)
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

        let source_questions = exam_package_questions::Entity::find()
            .filter(exam_package_questions::Column::SectionId.eq(section.id))
            .all(&txn)
            .await
            .map_err(|e| AppError::Internal(e.to_string()))?;

        if !source_questions.is_empty() {
            let models: Vec<exam_package_questions::ActiveModel> = source_questions
                .into_iter()
                .map(|q| exam_package_questions::ActiveModel {
                    package_id: Set(new_pkg.id),
                    section_id: Set(new_sec.id),
                    question_id: Set(q.question_id),
                    order: Set(q.order),
                })
                .collect();
            exam_package_questions::Entity::insert_many(models)
                .exec(&txn)
                .await
                .map_err(|e| AppError::Internal(e.to_string()))?;
        }
    }

    txn.commit()
        .await
        .map_err(|e| AppError::Internal(e.to_string()))?;

    Ok(ClonePackageData {
        id: new_pkg.id,
        parent_package_id: new_pkg.parent_package_id,
        title: new_pkg.title,
        exam_type: new_pkg.exam_type.into_value().to_string().trim_matches('\'').to_string(),
        total_sections: new_pkg.total_sections,
        total_questions: new_pkg.total_questions,
    })
}
