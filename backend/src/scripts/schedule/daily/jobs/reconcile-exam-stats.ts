#!/usr/bin/env node
/**
 * Script to reconcile exam user statistics (Global, Subject, Tag)
 *
 * Performance features:
 * 1. Pure SQL CTE queries executed directly inside PostgreSQL.
 * 2. 24-hour modified window filter to target active sessions.
 * 3. `IS DISTINCT FROM` guards to prevent unnecessary DB updates when stats haven't changed.
 * 4. Zero Node.js memory footprint (no large array mapping in JS memory).
 */

import { db } from '../../../../db/db-pool.ts';
import { sql } from 'drizzle-orm';
import { fileURLToPath } from 'url';

async function reconcileExamStats() {
  console.log('[Job] Starting exam stats reconciliation process...');

  try {
    // 1. Rebuild Global Stats
    await db.execute(sql`
      WITH global_stats AS (
        SELECT 
          es.user_id,
          COUNT(DISTINCT CASE WHEN es.status = 'completed' THEN es.id END)::int as total_exams_taken,
          COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END)::int as total_questions_answered,
          COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::int as total_correct_answers,
          COUNT(CASE WHEN esa.is_correct = false THEN 1 END)::int as total_wrong_answers,
          COALESCE(AVG(CASE WHEN es.status = 'completed' THEN es.score END), 0)::numeric(10,2) as average_score,
          MAX(es.updated_at) as last_active_at
        FROM exam_sessions es
        LEFT JOIN exam_session_answers esa ON esa.session_id = es.id
        WHERE es.updated_at >= NOW() - INTERVAL '24 hours' 
           OR esa.created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY es.user_id
      )
      INSERT INTO exam_user_stats_global (
        user_id, total_exams_taken, total_questions_answered, total_correct_answers, total_wrong_answers, average_score, last_active_at, updated_at
      )
      SELECT 
        user_id, total_exams_taken, total_questions_answered, total_correct_answers, total_wrong_answers, average_score, last_active_at, NOW()
      FROM global_stats
      ON CONFLICT (user_id) DO UPDATE
      SET 
        total_exams_taken = EXCLUDED.total_exams_taken,
        total_questions_answered = EXCLUDED.total_questions_answered,
        total_correct_answers = EXCLUDED.total_correct_answers,
        total_wrong_answers = EXCLUDED.total_wrong_answers,
        average_score = EXCLUDED.average_score,
        last_active_at = EXCLUDED.last_active_at,
        updated_at = NOW()
      WHERE 
        exam_user_stats_global.total_exams_taken IS DISTINCT FROM EXCLUDED.total_exams_taken OR
        exam_user_stats_global.total_questions_answered IS DISTINCT FROM EXCLUDED.total_questions_answered OR
        exam_user_stats_global.total_correct_answers IS DISTINCT FROM EXCLUDED.total_correct_answers OR
        exam_user_stats_global.total_wrong_answers IS DISTINCT FROM EXCLUDED.total_wrong_answers OR
        exam_user_stats_global.average_score IS DISTINCT FROM EXCLUDED.average_score;
    `);

    // 2. Rebuild Subject Stats
    await db.execute(sql`
      WITH subject_stats AS (
        SELECT 
          es.user_id,
          eq.subject_id,
          COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END)::int as total_questions_answered,
          COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::int as total_correct,
          COUNT(CASE WHEN esa.is_correct = false THEN 1 END)::int as total_wrong,
          COALESCE((COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END), 0)) * 100, 0)::numeric(5,2) as accuracy_rate
        FROM exam_sessions es
        INNER JOIN exam_session_answers esa ON esa.session_id = es.id
        INNER JOIN exam_questions eq ON eq.id = esa.question_id
        WHERE es.updated_at >= NOW() - INTERVAL '24 hours'
           OR esa.created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY es.user_id, eq.subject_id
      )
      INSERT INTO exam_user_stats_subject (
        user_id, subject_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, updated_at
      )
      SELECT 
        user_id, subject_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, NOW()
      FROM subject_stats
      ON CONFLICT (user_id, subject_id) DO UPDATE
      SET 
        total_questions_answered = EXCLUDED.total_questions_answered,
        total_correct = EXCLUDED.total_correct,
        total_wrong = EXCLUDED.total_wrong,
        accuracy_rate = EXCLUDED.accuracy_rate,
        updated_at = NOW()
      WHERE 
        exam_user_stats_subject.total_questions_answered IS DISTINCT FROM EXCLUDED.total_questions_answered OR
        exam_user_stats_subject.total_correct IS DISTINCT FROM EXCLUDED.total_correct OR
        exam_user_stats_subject.total_wrong IS DISTINCT FROM EXCLUDED.total_wrong OR
        exam_user_stats_subject.accuracy_rate IS DISTINCT FROM EXCLUDED.accuracy_rate;
    `);

    // 3. Rebuild Tag Stats
    await db.execute(sql`
      WITH tag_stats AS (
        SELECT 
          es.user_id,
          eqt.tag_id,
          COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END)::int as total_questions_answered,
          COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::int as total_correct,
          COUNT(CASE WHEN esa.is_correct = false THEN 1 END)::int as total_wrong,
          COALESCE((COUNT(CASE WHEN esa.is_correct = true THEN 1 END)::numeric / NULLIF(COUNT(CASE WHEN esa.is_correct IS NOT NULL THEN 1 END), 0)) * 100, 0)::numeric(5,2) as accuracy_rate
        FROM exam_sessions es
        INNER JOIN exam_session_answers esa ON esa.session_id = es.id
        INNER JOIN exam_question_tags eqt ON eqt.question_id = esa.question_id
        WHERE es.updated_at >= NOW() - INTERVAL '24 hours'
           OR esa.created_at >= NOW() - INTERVAL '24 hours'
        GROUP BY es.user_id, eqt.tag_id
      )
      INSERT INTO exam_user_stats_tag (
        user_id, tag_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, updated_at
      )
      SELECT 
        user_id, tag_id, total_questions_answered, total_correct, total_wrong, accuracy_rate, NOW()
      FROM tag_stats
      ON CONFLICT (user_id, tag_id) DO UPDATE
      SET 
        total_questions_answered = EXCLUDED.total_questions_answered,
        total_correct = EXCLUDED.total_correct,
        total_wrong = EXCLUDED.total_wrong,
        accuracy_rate = EXCLUDED.accuracy_rate,
        updated_at = NOW()
      WHERE 
        exam_user_stats_tag.total_questions_answered IS DISTINCT FROM EXCLUDED.total_questions_answered OR
        exam_user_stats_tag.total_correct IS DISTINCT FROM EXCLUDED.total_correct OR
        exam_user_stats_tag.total_wrong IS DISTINCT FROM EXCLUDED.total_wrong OR
        exam_user_stats_tag.accuracy_rate IS DISTINCT FROM EXCLUDED.accuracy_rate;
    `);

    console.log('[Job] Exam stats reconciled successfully.');
    return {
      success: true,
      message: 'Exam stats reconciled successfully',
    };
  } catch (error) {
    console.error('[Job] Error reconciling exam stats:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1] === fileURLToPath(import.meta.url)) {
  reconcileExamStats()
    .then((result) => {
      console.log('Result:', JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch((error) => {
      console.error('Reconciliation job failed:', error);
      process.exit(1);
    });
}

export default reconcileExamStats;
