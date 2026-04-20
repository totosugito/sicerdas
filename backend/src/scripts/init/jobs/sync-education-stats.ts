import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../../../db/schema/index.ts";
import { examPackages } from "../../../db/schema/exam/index.ts";
import { EnumContentType } from "../../../db/schema/enum/enum-app.ts";
import { EnumExamType } from "../../../db/schema/exam/enums.ts";
import envConfig from "../../../config/env.config.ts";
import dotenv from "dotenv";
import { recalculateEducationStats } from "../../../utils/education-stats-utils.ts";

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === "development" ? ".env.devel" : ".env" });

/**
 * Function to synchronize all education category-grade statistics
 */
export async function syncEducationStats() {
  console.log("\n--- Synchronizing Education Category-Grade Statistics ---");

  // Since we might have different content types in the future, we loop through them
  // For now, only Exam type is supported for statistics

  console.log(`\n[Exam] Processing Official packages...`);

  const pool = new pg.Pool({
    connectionString: envConfig.db.url,
    max: 10,
  });

  try {
    // Drizzle instance for the job
    const db = drizzle({ client: pool, schema });

    // 1. Get all unique Category/Grade combinations from examPackages
    const combos = await db
      .select({
        categoryId: examPackages.categoryId,
        educationGradeId: examPackages.educationGradeId,
      })
      .from(examPackages)
      .where(eq(examPackages.examType, EnumExamType.OFFICIAL))
      .groupBy(examPackages.categoryId, examPackages.educationGradeId);

    console.log(`Found ${combos.length} unique Category/Grade combinations in Exams.`);

    let updatedCount = 0;
    for (const combo of combos) {
      if (combo.categoryId && combo.educationGradeId) {
        await recalculateEducationStats(
          EnumContentType.EXAM,
          combo.categoryId,
          combo.educationGradeId,
        );
        updatedCount++;

        if (updatedCount % 10 === 0) {
          console.log(`Updated ${updatedCount}/${combos.length} combinations...`);
        }
      }
    }

    console.log(`Successfully updated ${updatedCount} Exam statistics records.`);
  } catch (error) {
    console.error("Sync education stats job failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

/**
 * Main function to run the sync job
 */
export async function runSyncStats() {
  try {
    await syncEducationStats();
    console.log("\nEducation stats synchronization completed successfully!");
  } catch (error) {
    console.error("Sync job failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("sync-education-stats.ts")
) {
  runSyncStats()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
