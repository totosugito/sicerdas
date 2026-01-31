
import archiveGuestEvents from './jobs/archive-guest-events.ts';
import updateBookStats from './jobs/update-book-stats.ts';
import { db } from '../../db/index.ts';
import { jobLogs } from '../../db/schema/job-logs-schema.ts';
import { EnumJobStatus, EnumJobGroup, EnumJobTrigger } from '../../db/schema/enum-general.ts';

const runJobWithLog = async (
    jobName: string,
    jobFunction: () => Promise<any>
) => {
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
            result: result
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
            result: { stack: error.stack }
        });
        throw error;
    }
};

const runDailyJobs = async () => {
    console.log('Starting daily scheduled jobs...');
    const startTime = new Date();

    try {
        console.log('----------------------------------------');
        console.log('Job 1/2: Archiving Guest Events');
        console.log('----------------------------------------');

        await runJobWithLog('archive-guest-events', archiveGuestEvents);
        console.log('✓ Archiving Guest Events completed');

        console.log('\n----------------------------------------');
        console.log('Job 2/2: Updating Book Statistics');
        console.log('----------------------------------------');

        await runJobWithLog('update-book-stats', updateBookStats);
        console.log('✓ Updating Book Statistics completed');

        const endTime = new Date();
        const duration = endTime.getTime() - startTime.getTime();

        console.log('\n========================================');
        console.log(`All daily jobs completed successfully in ${(duration / 1000).toFixed(2)}s`);
        console.log('========================================');

        process.exit(0);
    } catch (error: any) {
        console.error('\n❌ Daily jobs failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runDailyJobs();
}

export default runDailyJobs;