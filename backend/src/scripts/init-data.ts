import pg from "pg";
import envConfig from "../config/env.config.ts";
import {drizzle} from "drizzle-orm/node-postgres";
import {eq, and} from "drizzle-orm";
import * as schema from '../db/schema/index.ts';
import dotenv from 'dotenv';
import {bookCategory, bookGroup, educationGrades, bookStats, EnumBookStats, EnumDataType, EnumDataStatus} from "../db/schema/index.ts";

dotenv.config({ path: process.env.NODE_ENV === 'development' ? '.env.devel' : '.env' });

async function seed() {
  const pool = new pg.Pool({
    connectionString: envConfig.db.url,
    max: 10,
  });

  try {
    const db = drizzle({client: pool, schema});

    const versionId = 1;
    const versionData_ = [
      {
        id: 1,
        appVersion: 1,
        dbVersion: 250101,
        dataType: EnumDataType.book,
        status: EnumDataStatus.published,
        name: "",
        note: "Initial Data"},
    ]

    // default data for education grade
    const educationGrades_ = [
      {versionId: versionId, grade: "1", name: "SD"},
      {versionId: versionId, grade: "2", name: "SD"},
      {versionId: versionId, grade: "3", name: "SD"},
      {versionId: versionId, grade: "4", name: "SD"},
      {versionId: versionId, grade: "5", name: "SD"},
      {versionId: versionId, grade: "6", name: "SD"},
      {versionId: versionId, grade: "7", name: "SMP"},
      {versionId: versionId, grade: "8", name: "SMP"},
      {versionId: versionId, grade: "9", name: "SMP"},
      {versionId: versionId, grade: "10", name: "SMA"},
      {versionId: versionId, grade: "11", name: "SMA"},
      {versionId: versionId, grade: "12", name: "SMA"},
      {versionId: versionId, grade: "preschool", name: "Pra Sekolah"},
      {versionId: versionId, grade: "paud", name: "PAUD"},
      {versionId: versionId, grade: "empty", name: ""},
      {versionId: versionId, grade: "level_1", name: "Level 1"},
      {versionId: versionId, grade: "level_2", name: "Level 2"},
      {versionId: versionId, grade: "level_3", name: "Level 3"},
      {versionId: versionId, grade: "level_4", name: "Level 4"}
    ]

    // default data for books category
    const bookCategories_ = [
      {versionId: versionId, code: "k06", name: "Kurikulum 2006"},
      {versionId: versionId, code: "k13", name: "Kurikulum 2013"},
      {versionId: versionId, code: "merdeka", name: "Kurikulum Merdeka"},
      {versionId: versionId, code: "pendidikan", name: "Buku Pendidikan"},
      {versionId: versionId, code: "cerita_terjemahan", name: "Cerita Terjemahan"},
      {versionId: versionId, code: "buku_komputer", name: "Buku Komputer"},
      {versionId: versionId, code: "sastra", name: "Sastra"},
    ]

    // default data for books group
    const bookGroups_ = [
      {versionId: versionId, categoryCode: "k06", name: "Kurikulum 2006"},
      {versionId: versionId, categoryCode: "k06", name: "SMK"},
      {versionId: versionId, categoryCode: "k13", name: "Kurikulum 2013 Siswa"},
      {versionId: versionId, categoryCode: "k13", name: "Kurikulum 2013 Guru"},
      {versionId: versionId, categoryCode: "k13", name: "SMK Kita BISA!"},
      {versionId: versionId, categoryCode: "k13", name: "SMK K13"},
      {versionId: versionId, categoryCode: "merdeka", name: "Kurikulum Merdeka Siswa"},
      {versionId: versionId, categoryCode: "merdeka", name: "Kurikulum Merdeka Guru"},
      {versionId: versionId, categoryCode: "pendidikan", name: "KPK"},
      {versionId: versionId, categoryCode: "pendidikan", name: "KAMUS"},
      {versionId: versionId, categoryCode: "pendidikan", name: "Agama Islam"},
      {versionId: versionId, categoryCode: "pendidikan", name: "Pengetahuan Umum"},
      {versionId: versionId, categoryCode: "pendidikan", name: "IslamHouse.com"},
      {versionId: versionId, categoryCode: "pendidikan", name: "RumahFiqih.com"},
      {versionId: versionId, categoryCode: "cerita_terjemahan", name: "English"},
      {versionId: versionId, categoryCode: "cerita_terjemahan", name: "Bahasa Indonesia"},
      {versionId: versionId, categoryCode: "cerita_terjemahan", name: "Basa Jawa"},
      {versionId: versionId, categoryCode: "cerita_terjemahan", name: "Basa Sunda"},
      {versionId: versionId, categoryCode: "buku_komputer", name: "Pengetahuan Komputer"},
      {versionId: versionId, categoryCode: "buku_komputer", name: "Pemprograman"},
      {versionId: versionId, categoryCode: "buku_komputer", name: "Syncfusion.com"},
      {versionId: versionId, categoryCode: "sastra", name: "Komik Pendidikan"},
      {versionId: versionId, categoryCode: "sastra", name: "Pra Sekolah"},
      {versionId: versionId, categoryCode: "sastra", name: "Antologi Puisi"},
      {versionId: versionId, categoryCode: "sastra", name: "Bacaan PAUD"},
      {versionId: versionId, categoryCode: "sastra", name: "Bacaan SD"},
      {versionId: versionId, categoryCode: "sastra", name: "Bacaan SMP"},
      {versionId: versionId, categoryCode: "sastra", name: "Bacaan SMA"},
      {versionId: versionId, categoryCode: "sastra", name: "Bacaan SD Kelas 1, 2, 3"},
      {versionId: versionId, categoryCode: "sastra", name: "Bacaan SD Kelas 4, 5, 6"},
    ];

    // fill default version data
    for (const version of versionData_) {
      // Check if version exists
      const existingVersion = await db.select({ id: schema.appVersion.id }).from(schema.appVersion).where(eq(schema.appVersion.id, version.id)).then((result: { id: number }[]) => !!result[0]?.id);

      if (existingVersion) {
        // Update existing version
        await db.update(schema.appVersion)
          .set({
            appVersion: version.appVersion,
            dbVersion: version.dbVersion,
            dataType: version.dataType,
            status: version.status,
            name: version.name,
            note: version.note,
            updatedAt: new Date()
          })
          .where(eq(schema.appVersion.id, version.id));
      } else {
        // Insert new version
        await db.insert(schema.appVersion).values(version);
      }
    }

    // fill education grades
    for (const grade of educationGrades_) {
      // Check if grade exists
      const gradeExists = await db
        .select({ id: educationGrades.id })
        .from(educationGrades)
        .where(eq(educationGrades.grade, grade.grade))
        .then((result: { id: number }[]) => !!result[0]?.id);

      if (!gradeExists) {
        await db
          .insert(educationGrades)
          .values(grade);
      } else {
        await db
          .update(educationGrades)
          .set(grade)
          .where(eq(educationGrades.grade, grade.grade));
      }
    }

    // Insert book categories with existence check
    for (const category of bookCategories_) {
      const categoryExists = await db
        .select({ code: bookCategory.code })
        .from(bookCategory)
        .where(eq(bookCategory.code, category.code))
        .then((result: { code: string }[]) => !!result[0]?.code);

      if (!categoryExists) {
        await db
          .insert(bookCategory)
          .values(category);
      } else {
        await db
          .update(bookCategory)
          .set(category)
          .where(eq(bookCategory.code, category.code));
      }
    }

    // Insert books groups with proper category mapping and error handling
    // Using logger instead of console.log for better logging in production
    for (const group of bookGroups_) {
      try {
        // Get the category ID for this group
        const [category] = await db
          .select({ id: bookCategory.id })
          .from(bookCategory)
          .where(eq(bookCategory.code, group.categoryCode))
          .limit(1);

        if (!category) {
          console.warn(`Category not found for code: ${group.categoryCode}, skipping group: ${group.name}`);
          continue;
        }

        // Check if group exists with the same name and category
        const [existingGroup] = await db
          .select()
          .from(bookGroup)
          .where(
            and(
              eq(bookGroup.name, group.name),
              eq(bookGroup.categoryId, category.id)
            )
          )
          .limit(1);

        const groupData = {
          versionId: group.versionId,
          categoryId: category.id,
          name: group.name,
        };

        if (!existingGroup) {
          await db
            .insert(bookGroup)
            .values(groupData);
        } else {
          await db
          .update(bookGroup)
          .set(groupData)
          .where(eq(bookGroup.id, existingGroup.id));
        }
      } catch (error) {
        console.error(`Error processing group: ${group.name}`, error);
      }
    }

    // -------------------------------------------------------------
    // Insert books category stats data with existence check
    // -------------------------------------------------------------
    const booksCategoryData_ = await db.select().from(bookCategory);
    for (const category of booksCategoryData_) {
      const categoryDataExists = await db
        .select({ id: bookStats.id })
        .from(bookStats)
        .where(
          and(
            eq(bookStats.referenceId, category.id),
            eq(bookStats.type, EnumBookStats.category)
          )
        )
        .then((result: { id: string }[]) => !!result[0]?.id);

      if (!categoryDataExists) {
        await db
          .insert(bookStats)
          .values({
            referenceId: category.id,
            type: EnumBookStats.category,
            total: 0
          });
      } else {
        await db
          .update(bookStats)
          .set({ total: 0 })
          .where(
            and(
              eq(bookStats.referenceId, category.id),
              eq(bookStats.type, EnumBookStats.category)
            )
          );
      }
    }

    // -------------------------------------------------------------
    // Insert books group stats data with existence check
    // -------------------------------------------------------------
    const booksGroupData_ = await db.select().from(bookGroup);
    for (const group of booksGroupData_) {
      const groupDataExists = await db
        .select({ id: bookStats.id })
        .from(bookStats)
        .where(
          and(
            eq(bookStats.referenceId, group.id),
            eq(bookStats.type, EnumBookStats.group)
          )
        )
        .then((result: { id: string }[]) => !!result[0]?.id);

      if (!groupDataExists) {
        await db
          .insert(bookStats)
          .values({
            referenceId: group.id,
            type: EnumBookStats.group,
            total: 0
          });
      } else {
        await db
          .update(bookStats)
          .set({ total: 0 })
          .where(
            and(
              eq(bookStats.referenceId, group.id),
              eq(bookStats.type, EnumBookStats.group)
            )
          );
      }
    }
  }
  catch (error) {
    console.error(error);
  }
  finally {
    await pool.end();
  }
}

// Run the seed function with error handling
seed()
  .then(() => {
    // biome-ignore lint/suspicious/noConsoleLog: <explanation>
    console.log('Database initialization completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Database initialization failed:', error);
    process.exit(1);
  });
