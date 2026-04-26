import archiveGuestEvents from "./jobs/archive-guest-events.ts";
import updateBookStats from "./jobs/update-book-stats.ts";
import reconcileExamStats from "./jobs/reconcile-exam-stats.ts";
import { purgeOldExamAnswers } from "./jobs/purge-old-exam-answers.ts";
import { cleanStaleSessions } from "./jobs/clean-stale-sessions.ts";
import { db } from "../../../db/db-pool.ts";
import { jobLogs } from "../../../db/schema/jobs/index.ts";
import {
  EnumJobStatus,
  EnumJobGroup,
  EnumJobTrigger,
} from "../../../db/schema/enum/enum-general.ts";
import { fileURLToPath } from "url";

const runJobWithLog = async (jobName: string, jobFunction: () => Promise<any>) => {
  const startTime = new Date();
  try {
    const result = await jobFunction();
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    await db.insert(jobLogs).values({
      jobName: jobName,
      group: EnumJobGroup.DAILY,
      status: EnumJobStatus.SUCCESS,
      triggeredBy: EnumJobTrigger.SYSTEM,
      startTime: startTime,
      endTime: endTime,
      durationMs: duration,
      result: result,
    });
    return result;
  } catch (error: any) {
    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();
    await db.insert(jobLogs).values({
      jobName: jobName,
      group: EnumJobGroup.DAILY,
      status: EnumJobStatus.FAILED,
      triggeredBy: EnumJobTrigger.SYSTEM,
      startTime: startTime,
      endTime: endTime,
      durationMs: duration,
      error: error.message || String(error),
      result: { stack: error.stack },
    });
    throw error;
  }
};

const runDailyJobs = async () => {
  console.log("Starting daily scheduled jobs...");
  const startTime = new Date();

  try {
    console.log("----------------------------------------");
    console.log("Job 1/5: Archiving Guest Events");
    console.log("----------------------------------------");

    await runJobWithLog("archive-guest-events", archiveGuestEvents);
    console.log("✓ Archiving Guest Events completed");

    console.log("\n----------------------------------------");
    console.log("Job 2/5: Updating Book Statistics");
    console.log("----------------------------------------");

    await runJobWithLog("update-book-stats", updateBookStats);
    console.log("✓ Updating Book Statistics completed");

    console.log("\n----------------------------------------");
    console.log("Job 3/5: Reconciling Exam Statistics");
    console.log("----------------------------------------");

    await runJobWithLog("reconcile-exam-stats", reconcileExamStats);
    console.log("✓ Reconciling Exam Statistics completed");

    console.log("\n----------------------------------------");
    console.log("Job 4/5: Purging Old Exam Answers");
    console.log("----------------------------------------");

    await runJobWithLog("purge-old-exam-answers", purgeOldExamAnswers);
    console.log("✓ Purging Old Exam Answers completed");

    console.log("\n----------------------------------------");
    console.log("Job 5/5: Cleaning Stale Sessions");
    console.log("----------------------------------------");

    await runJobWithLog("clean-stale-sessions", cleanStaleSessions);
    console.log("✓ Cleaning Stale Sessions completed");

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log("\n========================================");
    console.log(`All daily jobs completed successfully in ${(duration / 1000).toFixed(2)}s`);
    console.log("========================================");

    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Daily jobs failed:", error);
    process.exit(1);
  }
};

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runDailyJobs();
}

export default runDailyJobs;
