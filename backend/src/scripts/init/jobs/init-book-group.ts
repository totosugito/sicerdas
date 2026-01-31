import pg from "pg";
import envConfig from "../../../config/env.config.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and } from "drizzle-orm";
import * as schema from '../../../db/schema/index.ts';
import dotenv from 'dotenv';
import { bookCategory, bookGroup } from "../../../db/schema/book-schema.ts";
import { educationGrades } from "../../../db/schema/education-schema.ts";
import { EnumContentType, EnumContentStatus } from "../../../db/schema/enum-app.ts";

dotenv.config({ path: process.env.NODE_ENV === 'development' ? '.env.devel' : '.env' });

export default async function seed() {
  const pool = new pg.Pool({
    connectionString: envConfig.db.url,
    max: 10,
  });

  try {
    const db = drizzle({ client: pool, schema });

    const versionId = 1;
    const versionData_ = [
      {
        id: 1,
        appVersion: 1,
        dbVersion: 250101,
        dataType: EnumContentType.BOOK,
        status: EnumContentStatus.PUBLISHED,
        name: "",
        note: "Initial Data"
      },
    ]

    // default data for education grade
    const educationGrades_ = [
      { id: 1, versionId: versionId, grade: "1", name: "SD" },
      { id: 2, versionId: versionId, grade: "2", name: "SD" },
      { id: 3, versionId: versionId, grade: "3", name: "SD" },
      { id: 4, versionId: versionId, grade: "4", name: "SD" },
      { id: 5, versionId: versionId, grade: "5", name: "SD" },
      { id: 6, versionId: versionId, grade: "6", name: "SD" },
      { id: 7, versionId: versionId, grade: "7", name: "SMP" },
      { id: 8, versionId: versionId, grade: "8", name: "SMP" },
      { id: 9, versionId: versionId, grade: "9", name: "SMP" },
      { id: 10, versionId: versionId, grade: "10", name: "SMA" },
      { id: 11, versionId: versionId, grade: "11", name: "SMA" },
      { id: 12, versionId: versionId, grade: "12", name: "SMA" },
      { id: 13, versionId: versionId, grade: "preschool", name: "Pra Sekolah" },
      { id: 14, versionId: versionId, grade: "paud", name: "PAUD" },
      { id: 15, versionId: versionId, grade: "empty", name: "Umum" },
      { id: 16, versionId: versionId, grade: "level_1", name: "Level 1" },
      { id: 17, versionId: versionId, grade: "level_2", name: "Level 2" },
      { id: 18, versionId: versionId, grade: "level_3", name: "Level 3" },
      { id: 19, versionId: versionId, grade: "level_4", name: "Level 4" },
      { id: 20, versionId: versionId, grade: "sd", name: "SD" },
      { id: 21, versionId: versionId, grade: "smp", name: "SMP" },
      { id: 22, versionId: versionId, grade: "sma", name: "SMA" },
      { id: 23, versionId: versionId, grade: "smk", name: "SMK" },
      { id: 24, versionId: versionId, grade: "sd_smp", name: "SD/SMP" },
    ]

    // default data for books category
    const bookCategories_ = [
      { id: 1, versionId: versionId, code: "k06", name: "Kurikulum 2006" },
      { id: 2, versionId: versionId, code: "k13", name: "Kurikulum 2013" },
      { id: 3, versionId: versionId, code: "merdeka", name: "Kurikulum Merdeka" },
      { id: 4, versionId: versionId, code: "pendidikan", name: "Buku Pendidikan" },
      { id: 5, versionId: versionId, code: "cerita_terjemahan", name: "Cerita Terjemahan" },
      { id: 6, versionId: versionId, code: "buku_komputer", name: "Buku Komputer" },
      { id: 7, versionId: versionId, code: "sastra", name: "Sastra" },
    ]

    // default data for books group
    const bookGroups_ = [
      { id: 1, versionId: versionId, categoryCode: "k06", name: "Kurikulum 2006", shortName: "KTSP" },
      { id: 2, versionId: versionId, categoryCode: "k06", name: "SMK", shortName: "SMK" },
      { id: 3, versionId: versionId, categoryCode: "k13", name: "Kurikulum 2013 Siswa", shortName: "K13 Siswa" },
      { id: 4, versionId: versionId, categoryCode: "k13", name: "Kurikulum 2013 Guru", shortName: "K13 Guru" },
      { id: 5, versionId: versionId, categoryCode: "k13", name: "SMK Kita BISA!", shortName: "SMK Kita BISA!" },
      { id: 6, versionId: versionId, categoryCode: "k13", name: "SMK K13", shortName: "SMK K13" },
      { id: 7, versionId: versionId, categoryCode: "merdeka", name: "Kurikulum Merdeka Siswa", shortName: "Merdeka Siswa" },
      { id: 8, versionId: versionId, categoryCode: "merdeka", name: "Kurikulum Merdeka Guru", shortName: "Merdeka Guru" },
      { id: 9, versionId: versionId, categoryCode: "pendidikan", name: "KPK", shortName: "KPK" },
      { id: 10, versionId: versionId, categoryCode: "pendidikan", name: "KAMUS", shortName: "KAMUS" },
      { id: 11, versionId: versionId, categoryCode: "pendidikan", name: "Agama Islam", shortName: "Agama Islam" },
      { id: 12, versionId: versionId, categoryCode: "pendidikan", name: "Pengetahuan Umum", shortName: "Pengetahuan Umum" },
      { id: 13, versionId: versionId, categoryCode: "pendidikan", name: "IslamHouse.com", shortName: "IslamHouse.com" },
      { id: 14, versionId: versionId, categoryCode: "pendidikan", name: "RumahFiqih.com", shortName: "RumahFiqih.com" },
      { id: 15, versionId: versionId, categoryCode: "cerita_terjemahan", name: "English", shortName: "English" },
      { id: 16, versionId: versionId, categoryCode: "cerita_terjemahan", name: "Bahasa Indonesia", shortName: "Bahasa Indonesia" },
      { id: 17, versionId: versionId, categoryCode: "cerita_terjemahan", name: "Basa Jawa", shortName: "Basa Jawa" },
      { id: 18, versionId: versionId, categoryCode: "cerita_terjemahan", name: "Basa Sunda", shortName: "Basa Sunda" },
      { id: 19, versionId: versionId, categoryCode: "buku_komputer", name: "Pengetahuan Komputer", shortName: "Ilmu Komputer" },
      { id: 20, versionId: versionId, categoryCode: "buku_komputer", name: "Pemprograman", shortName: "Pemprograman" },
      { id: 21, versionId: versionId, categoryCode: "buku_komputer", name: "Syncfusion.com", shortName: "Syncfusion.com" },
      { id: 22, versionId: versionId, categoryCode: "sastra", name: "Komik Pendidikan", shortName: "Komik Pendidikan" },
      { id: 23, versionId: versionId, categoryCode: "sastra", name: "Pra Sekolah", shortName: "Pra Sekolah" },
      { id: 24, versionId: versionId, categoryCode: "sastra", name: "Antologi Puisi", shortName: "Antologi Puisi" },
      { id: 25, versionId: versionId, categoryCode: "sastra", name: "Bacaan PAUD", shortName: "Bacaan PAUD" },
      { id: 26, versionId: versionId, categoryCode: "sastra", name: "Bacaan SD", shortName: "Bacaan SD" },
      { id: 27, versionId: versionId, categoryCode: "sastra", name: "Bacaan SMP", shortName: "Bacaan SMP" },
      { id: 28, versionId: versionId, categoryCode: "sastra", name: "Bacaan SMA", shortName: "Bacaan SMA" },
      { id: 29, versionId: versionId, categoryCode: "sastra", name: "Bacaan SD Kelas 1, 2, 3", shortName: "Bacaan SD 1-3" },
      { id: 30, versionId: versionId, categoryCode: "sastra", name: "Bacaan SD Kelas 4, 5, 6", shortName: "Bacaan SD 4-6" },
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
        .where(eq(educationGrades.id, grade.id))
        .then((result: { id: number }[]) => !!result[0]?.id);

      if (!gradeExists) {
        await db
          .insert(educationGrades)
          .values(grade);
      } else {
        await db
          .update(educationGrades)
          .set(grade)
          .where(eq(educationGrades.id, grade.id));
      }
    }

    // Insert book categories with existence check
    for (const category of bookCategories_) {
      const categoryExists = await db
        .select({ code: bookCategory.code })
        .from(bookCategory)
        .where(eq(bookCategory.id, category.id))
        .then((result: { code: string }[]) => !!result[0]?.code);

      if (!categoryExists) {
        await db
          .insert(bookCategory)
          .values(category);
      } else {
        await db
          .update(bookCategory)
          .set(category)
          .where(eq(bookCategory.id, category.id));
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
          id: group.id,
          versionId: group.versionId,
          categoryId: category.id,
          name: group.name,
          shortName: group.shortName,
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
  }
  catch (error) {
    console.error(error);
  }
  finally {
    await pool.end();
  }
}

// Run the seed function with error handling
// Run the seed function with error handling if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
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
}
