import archiveGuestEvents from "./jobs/archive-guest-events.ts";
import updateBookStats from "./jobs/update-book-stats.ts";
import reconcileExamStats from "./jobs/reconcile-exam-stats.ts";
import { purgeOldExamAnswers } from "./jobs/purge-old-exam-answers.ts";
import { cleanStaleSessions } from "./jobs/clean-stale-sessions.ts";
import { updateUserStats } from "./jobs/update-user-stats.ts";
import { db } from "../../../db/db-pool.ts";
import { jobLogs } from "../../../db/schema/jobs/index.ts";
import {
  EnumJobStatus,
  EnumJobGroup,
  EnumJobTrigger,
} from "../../../db/schema/enum/enum-general.ts";
import { fileURLToPath } from "url";

export interface DailyJobDefinition {
  id: string;
  name: string;
  enabled: boolean;
  fn: () => Promise<any>;
}

/**
 * Registry of all daily scheduled jobs.
 * Set `enabled: false` to disable a job by default, or use CLI flags (`--only`, `--skip`).
 */
export const DAILY_JOBS: DailyJobDefinition[] = [
  { id: "archive-guest-events", name: "Archiving Guest Events", enabled: true, fn: archiveGuestEvents },
  { id: "update-book-stats", name: "Updating Book Statistics", enabled: true, fn: updateBookStats },
  { id: "reconcile-exam-stats", name: "Reconciling Exam Statistics", enabled: true, fn: reconcileExamStats },
  { id: "purge-old-exam-answers", name: "Purging Old Exam Answers", enabled: true, fn: purgeOldExamAnswers },
  { id: "clean-stale-sessions", name: "Cleaning Stale Sessions", enabled: true, fn: cleanStaleSessions },
  { id: "update-user-stats", name: "Updating User Statistics", enabled: true, fn: updateUserStats },
];

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

export interface RunDailyJobsOptions {
  only?: string[];
  skip?: string[];
}

export const runDailyJobs = async (options: RunDailyJobsOptions = {}) => {
  console.log("Starting daily scheduled jobs...");
  const startTime = new Date();

  // Filter jobs based on configuration and arguments
  let jobsToRun = DAILY_JOBS.filter((j) => j.enabled);

  if (options.only && options.only.length > 0) {
    const onlySet = new Set(options.only.map((s) => s.trim().toLowerCase()));
    jobsToRun = DAILY_JOBS.filter((j) => onlySet.has(j.id.toLowerCase()));
  }

  if (options.skip && options.skip.length > 0) {
    const skipSet = new Set(options.skip.map((s) => s.trim().toLowerCase()));
    jobsToRun = jobsToRun.filter((j) => !skipSet.has(j.id.toLowerCase()));
  }

  if (jobsToRun.length === 0) {
    console.log("⚠️ No daily jobs matched the execution criteria.");
    return;
  }

  console.log(`Executing ${jobsToRun.length} job(s)...`);

  try {
    for (let i = 0; i < jobsToRun.length; i++) {
      const job = jobsToRun[i];
      console.log("\n----------------------------------------");
      console.log(`Job ${i + 1}/${jobsToRun.length}: ${job.name} (${job.id})`);
      console.log("----------------------------------------");

      await runJobWithLog(job.id, job.fn);
      console.log(`✓ ${job.name} completed`);
    }

    const endTime = new Date();
    const duration = endTime.getTime() - startTime.getTime();

    console.log("\n========================================");
    console.log(`All selected daily jobs completed successfully in ${(duration / 1000).toFixed(2)}s`);
    console.log("========================================");
  } catch (error: any) {
    console.error("\n❌ Daily jobs failed:", error);
    process.exit(1);
  }
};

// Parse CLI arguments when run directly
const parseCliArgs = (): RunDailyJobsOptions => {
  const args = process.argv.slice(2);
  const options: RunDailyJobsOptions = {};

  for (const arg of args) {
    if (arg === "--list") {
      console.log("Available Daily Jobs:");
      for (const job of DAILY_JOBS) {
        console.log(`  - ${job.id.padEnd(25)} : ${job.name} [Default: ${job.enabled ? "ENABLED" : "DISABLED"}]`);
      }
      process.exit(0);
    }
    if (arg.startsWith("--only=")) {
      options.only = arg.replace("--only=", "").split(",");
    }
    if (arg.startsWith("--skip=")) {
      options.skip = arg.replace("--skip=", "").split(",");
    }
  }

  return options;
};

// Run if called directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const options = parseCliArgs();
  runDailyJobs(options).then(() => process.exit(0));
}

export default runDailyJobs;
