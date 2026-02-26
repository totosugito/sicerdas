
import { pathToFileURL } from 'url';
import initUser from './jobs/init-user.ts';
import initBookGroup from './jobs/init-book-group.ts';
import importBooks from './jobs/import-book.ts';
import importPeriodicElements from './jobs/import-periodic-elements.ts';
import initTierPricing from './jobs/init-tier-pricing.ts';
import { runUpdateBookStats } from './jobs/update-book-stats.ts';

const runInitialData = async () => {
    // Configuration for data initialization
    const dataInput = {
        book: 'E:/Download/books.json',
        periodicTable: {
            elementPathFile: 'E:/Download/periodic-elements.json',
            notePathFile: 'E:/Download/periodic_note.json',
            assetImagesPath: "E:/Cloud/si-cerdas/table-periodic/images"
        }
    };

    // Configuration for enabling/disabling specific initialization tasks
    const processConfig = {
        initTierPricing: false,
        initUser: false,
        initBookGroup: false,
        importBooks: false,
        updateBookStats: true,
        importPeriodicElements: false
    };

    console.log('Starting initialization of all data...');
    const startTime = Date.now();

    try {
        if (processConfig.initTierPricing) {
            console.log('----------------------------------------');
            console.log('0. Initializing Tier Pricing');
            console.log('----------------------------------------');
            await initTierPricing();
            console.log('✓ Tier Pricing initialization completed');
        }

        if (processConfig.initUser) {
            console.log('\n----------------------------------------');
            console.log('1. Initializing Users');
            console.log('----------------------------------------');
            await initUser();
            console.log('✓ User initialization completed');
        }

        if (processConfig.initBookGroup) {
            console.log('\n----------------------------------------');
            console.log('2. Initializing Core Book Data');
            console.log('----------------------------------------');
            await initBookGroup();
            console.log('✓ Core Book Data initialization completed');
        }

        if (processConfig.importBooks) {
            console.log('\n----------------------------------------');
            console.log('3. Importing Books');
            console.log('----------------------------------------');
            await importBooks(dataInput.book);
            console.log('✓ Book import completed');
        }

        if (processConfig.updateBookStats) {
            console.log('\n----------------------------------------');
            console.log('4. Updating Book Statistics');
            console.log('----------------------------------------');
            await runUpdateBookStats();
            console.log('✓ Book statistics update completed');
        }

        if (processConfig.importPeriodicElements) {
            console.log('\n----------------------------------------');
            console.log('5. Importing Periodic Elements');
            console.log('----------------------------------------');
            await importPeriodicElements(dataInput.periodicTable);
            console.log('✓ Periodic elements import completed');
        }

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        console.log('\n========================================');
        console.log(`All initialization tasks completed successfully in ${duration}s`);
        console.log('========================================');
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Initialization failed:', error);
        process.exit(1);
    }
};

// Run if called directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
    runInitialData();
}

export default runInitialData;
