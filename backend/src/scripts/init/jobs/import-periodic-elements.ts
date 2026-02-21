import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../db/schema/index.ts';
import { periodicElements, periodicElementNotes } from '../../../db/schema/table-periodic/index.ts';
import envConfig from '../../../config/env.config.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: process.env.NODE_ENV === 'development' ? '.env.devel' : '.env' });

// Type definition for the JSON periodic element data
interface JsonPeriodicElementData {
  atomicId: number;
  idx: number;
  idy: number;
  atomicNumber: number;
  atomicGroup: string;
  atomicName: string;
  atomicSymbol: string;
  atomicProperties: Record<string, unknown> | string;
  atomicIsotope: Record<string, unknown> | string;
  atomicExtra: Record<string, unknown> | string;
  atomicImages: { atomic: string, safety: string, spectrum: string };
  [key: string]: any; // Allow for additional fields
}

// Type definition for the JSON periodic note data
interface JsonPeriodicNoteData {
  rowId: number;
  atomicNumber: number;
  localeCode: string;
  atomicOverview: string;
  atomicHistory: string;
  atomicApps: string;
  atomicFacts: string;
  [key: string]: any; // Allow for additional fields
}

// Input from default value from MySQL table
const dirAssets = ["atomic", "safety", "spectrum"];

interface ImportOptions {
  elementPathFile?: string;
  notePathFile?: string;
  assetImagesPath?: string;
}

async function importPeriodicElements(elementPathFile: string, assetImagesPath: string) {
  const pool = new pg.Pool({
    connectionString: envConfig.db.url,
    max: 10,
  });

  try {
    const db = drizzle({ client: pool, schema });

    if (!fs.existsSync(elementPathFile)) {
      throw new Error(`JSON file not found at: ${elementPathFile}`);
    }

    console.log('Reading periodic elements data from JSON file...');
    const jsonData = JSON.parse(fs.readFileSync(elementPathFile, 'utf8'));

    if (!Array.isArray(jsonData)) {
      throw new Error('JSON file should contain an array of periodic elements');
    }

    console.log(`Found ${jsonData.length} periodic elements to import`);

    let successCount = 0;
    let errorCount = 0;

    // Process each element
    for (const [index, elementData] of jsonData.entries()) {
      try {
        const jsonElement = elementData as JsonPeriodicElementData;

        // Validate required fields
        if (jsonElement.atomicId === undefined || jsonElement.idx === undefined || jsonElement.idy === undefined) {
          console.warn(`Skipping element at index ${index}: Missing required fields (atomicId, idx, or idy)`);
          errorCount++;
          continue;
        }

        // Parse JSON fields if they are strings
        let parsedProperties: Record<string, unknown> = {};
        let parsedIsotope: Record<string, unknown> = {};
        let parsedExtra: Record<string, unknown> = {};
        let parsedImages: Record<string, unknown> = {};

        if (jsonElement.atomicNumber >= 1 && jsonElement.atomicNumber <= 200) {
          const atomicIdStr = String(jsonElement.atomicNumber).padStart(3, '0');
          const extensions = ['jpg', 'png'];

          for (const assetDir of dirAssets) {
            let isFound = false;
            for (const ext of extensions) {
              const imageName = `${atomicIdStr}-${assetDir}.${ext}`;
              const fullPath = path.join(assetImagesPath, assetDir, imageName);
              if (fs.existsSync(fullPath)) {
                parsedImages[assetDir] = imageName;
                isFound = true;
                break;
              }
            }

            if (!isFound) {
              parsedImages[assetDir] = "";
            }
          }
        }

        try {
          if (typeof jsonElement.atomicProperties === 'string') {
            parsedProperties = JSON.parse(jsonElement.atomicProperties);
          } else if (typeof jsonElement.atomicProperties === 'object' && jsonElement.atomicProperties !== null) {
            parsedProperties = jsonElement.atomicProperties;
          }
        } catch (parseError) {
          console.warn(`Warning: Failed to parse atomicProperties for element "${jsonElement.atomicName}" (atomicId: ${jsonElement.atomicId}):`, parseError);
        }

        try {
          if (typeof jsonElement.atomicIsotope === 'string') {
            parsedIsotope = JSON.parse(jsonElement.atomicIsotope);
          } else if (typeof jsonElement.atomicIsotope === 'object' && jsonElement.atomicIsotope !== null) {
            parsedIsotope = jsonElement.atomicIsotope;
          }
        } catch (parseError) {
          console.warn(`Warning: Failed to parse atomicIsotope for element "${jsonElement.atomicName}" (atomicId: ${jsonElement.atomicId}):`, parseError);
        }

        try {
          if (typeof jsonElement.atomicExtra === 'string') {
            parsedExtra = JSON.parse(jsonElement.atomicExtra);
          } else if (typeof jsonElement.atomicExtra === 'object' && jsonElement.atomicExtra !== null) {
            parsedExtra = jsonElement.atomicExtra;
          }
        } catch (parseError) {
          console.warn(`Warning: Failed to parse atomicExtra for element "${jsonElement.atomicName}" (atomicId: ${jsonElement.atomicId}):`, parseError);
        }

        // Check if element already exists by atomicId
        const existingElement = await db
          .select({ id: periodicElements.id })
          .from(periodicElements)
          .where(eq(periodicElements.id, jsonElement.atomicId))
          .limit(1);

        const elementInsertData = {
          id: jsonElement.atomicId,
          idx: jsonElement.idx,
          idy: jsonElement.idy,
          atomicNumber: jsonElement.atomicNumber,
          atomicGroup: jsonElement.atomicGroup,
          atomicName: jsonElement.atomicName,
          atomicSymbol: jsonElement.atomicSymbol,
          atomicImages: parsedImages,
          atomicProperties: parsedProperties,
          atomicIsotope: parsedIsotope,
          atomicExtra: parsedExtra,
        };

        if (jsonElement.atomicNumber >= 1 && jsonElement.atomicNumber <= 200) {
          let props = parsedProperties;
          const numberOfNeutron = props["numberOfElectron"]
          const numberOfElectron = jsonElement.atomicNumber;
          props["numberOfNeutron"] = numberOfNeutron;
          props["numberOfElectron"] = numberOfElectron;
          elementInsertData.atomicProperties = props;
        } else {
          elementInsertData.atomicProperties = {};
        }

        let group = jsonElement.atomicGroup;
        if (group === 'otherNonMetals') {
          elementInsertData.atomicGroup = 'othernonmetals';
        } else if (group === 'nobleGases') {
          elementInsertData.atomicGroup = 'noble_gases';
        } else if (group === 'halogens') {
          elementInsertData.atomicGroup = 'halogens';
        } else if (group === 'metalloids') {
          elementInsertData.atomicGroup = 'metalloids';
        } else if (group === 'postTransitionMetals') {
          elementInsertData.atomicGroup = 'post_transition_metals';
        } else if (group === 'transitionMetals') {
          elementInsertData.atomicGroup = 'transition_metals';
        } else if (group === 'lanthanides') {
          elementInsertData.atomicGroup = 'lanthanoids';
        } else if (group === 'actinides') {
          elementInsertData.atomicGroup = 'actinoids';
        } else if (group === 'alkalineEarthMetals') {
          elementInsertData.atomicGroup = 'alkaline_earth_metals';
        } else if (group === 'alkaliMetals') {
          elementInsertData.atomicGroup = 'alkali_metals';
        }

        if (existingElement.length > 0) {
          // Update existing element
          await db
            .update(periodicElements)
            .set({
              ...elementInsertData,
            })
            .where(eq(periodicElements.id, jsonElement.atomicId));

          //   console.log(`Updated element: "${jsonElement.atomicName}" (atomicId: ${jsonElement.atomicId})`);
        } else {
          // Insert new element
          await db
            .insert(periodicElements)
            .values(elementInsertData);

          //   console.log(`Imported element: "${jsonElement.atomicName}" (atomicId: ${jsonElement.atomicId})`);
        }

        successCount++;

        // Progress indicator
        if ((index + 1) % 50 === 0) {
          console.log(`Processed ${index + 1}/${jsonData.length} elements...`);
        }

      } catch (elementError) {
        const jsonElement = elementData as JsonPeriodicElementData;
        const elementInfo = jsonElement?.atomicId ? `atomicId: ${jsonElement.atomicId}` : 'atomicId: unknown';
        console.error(`Error processing element at index ${index} (${elementInfo}):`, elementError);
        errorCount++;
      }
    }

    console.log('\n--- Import Summary ---');
    console.log(`Total elements processed: ${jsonData.length}`);
    console.log(`Successfully imported/updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

async function importPeriodicNotes(notePathFile: string) {
  const pool = new pg.Pool({
    connectionString: envConfig.db.url,
    max: 10,
  });

  try {
    const db = drizzle({ client: pool, schema });

    if (!fs.existsSync(notePathFile)) {
      throw new Error(`JSON file not found at: ${notePathFile}`);
    }

    console.log('Reading periodic notes data from JSON file...');
    const jsonData = JSON.parse(fs.readFileSync(notePathFile, 'utf8'));

    if (!Array.isArray(jsonData)) {
      throw new Error('JSON file should contain an array of periodic notes');
    }

    console.log(`Found ${jsonData.length} periodic notes to import`);

    let successCount = 0;
    let errorCount = 0;

    // Process each note
    for (const [index, noteData] of jsonData.entries()) {
      try {
        const jsonNote = noteData as JsonPeriodicNoteData;

        // Validate required fields
        if (jsonNote.rowId === undefined || jsonNote.atomicNumber === undefined || !jsonNote.localeCode) {
          console.warn(`Skipping note at index ${index}: Missing required fields (rowId, atomicNumber, or localeCode)`);
          errorCount++;
          continue;
        }

        // Check if note already exists by rowId
        const existingNote = await db
          .select({ id: periodicElementNotes.id })
          .from(periodicElementNotes)
          .where(eq(periodicElementNotes.id, jsonNote.rowId))
          .limit(1);

        const noteInsertData = {
          id: jsonNote.rowId,
          atomicNumber: jsonNote.atomicNumber,
          localeCode: jsonNote.localeCode,
          atomicOverview: jsonNote.atomicOverview,
          atomicHistory: jsonNote.atomicHistory,
          atomicApps: jsonNote.atomicApps,
          atomicFacts: jsonNote.atomicFacts,
        };

        if (existingNote.length > 0) {
          // Update existing note
          await db
            .update(periodicElementNotes)
            .set(noteInsertData)
            .where(eq(periodicElementNotes.id, jsonNote.rowId));

          //   console.log(`Updated note for element with atomic number: ${jsonNote.atomicNumber} (rowId: ${jsonNote.rowId})`);
        } else {
          // Insert new note
          await db
            .insert(periodicElementNotes)
            .values(noteInsertData);

          //   console.log(`Imported note for element with atomic number: ${jsonNote.atomicNumber} (rowId: ${jsonNote.rowId})`);
        }

        successCount++;

        // Progress indicator
        if ((index + 1) % 50 === 0) {
          console.log(`Processed ${index + 1}/${jsonData.length} notes...`);
        }

      } catch (noteError) {
        const jsonNote = noteData as JsonPeriodicNoteData;
        const noteInfo = jsonNote?.rowId ? `rowId: ${jsonNote.rowId}` : 'rowId: unknown';
        console.error(`Error processing note at index ${index} (${noteInfo}):`, noteError);
        errorCount++;
      }
    }

    console.log('\n--- Import Summary ---');
    console.log(`Total notes processed: ${jsonData.length}`);
    console.log(`Successfully imported/updated: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run both import functions
export default async function importAll(options: ImportOptions = {}) {
  const elementPathFile = options.elementPathFile || 'E:/Download/periodic-elements.json';
  const notePathFile = options.notePathFile || 'E:/Download/periodic_note.json';
  const assetImagesPath = options.assetImagesPath || "E:/Cloud/si-cerdas/table-periodic/images";

  try {
    await importPeriodicElements(elementPathFile, assetImagesPath);
    console.log('\n------------------------------------\n');
    await importPeriodicNotes(notePathFile);
    console.log('\n------------------------------------\n');
    console.log('All imports completed successfully!');
  } catch (error) {
    console.error('Import process failed:', error);
    process.exit(1);
  }
}

// Run the import function
if (import.meta.url === `file://${process.argv[1]}`) {
  importAll()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Import process failed:', error);
      process.exit(1);
    });
}