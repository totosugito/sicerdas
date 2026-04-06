import pg from "pg";
import envConfig from "../../../config/env.config.ts";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import * as schema from "../../../db/schema/index.ts";
import dotenv from "dotenv";
import { educationCategories, educationTags } from "../../../db/schema/education/index.ts";
import { examSubjects } from "../../../db/schema/exam/index.ts";
import { users } from "../../../db/schema/user/index.ts";

dotenv.config({ path: process.env.NODE_ENV === "development" ? ".env.devel" : ".env" });

export default async function seed() {
  const pool = new pg.Pool({
    connectionString: envConfig.db.url,
    max: 10,
  });

  try {
    const db = drizzle({ client: pool, schema });

    // 0. Get Admin User for createdByUserId
    const adminEmail = process.env.ADMIN_DEFAULT_EMAIL;
    if (!adminEmail) {
      throw new Error("ADMIN_DEFAULT_EMAIL is not defined in environment variables.");
    }

    const adminUser = await db.query.users.findFirst({
      where: eq(users.email, adminEmail.toLowerCase()),
    });

    if (!adminUser) {
      console.warn(
        `Admin user with email ${adminEmail} not found. Skipping createdByUserId assignment.`,
      );
    }

    const adminId = adminUser?.id;

    // 1. Initialize Categories
    const categoriesData = [
      { name: "Ujian Semester", key: "ujian-semester", description: "Persiapan ujian semester" },
      {
        name: "Kuis Mata Pelajaran",
        key: "kuis-mata-pelajaran",
        description: "Kuis khusus mata pelajaran",
      },
      { name: "Ujian Nasional", key: "ujian-nasional", description: "Latihan ujian nasional" },
      { name: "UTBK", key: "utbk", description: "Latihan tes berbasis komputer" },
      { name: "CPNS", key: "cpns", description: "Persiapan ujian calon pegawai negeri sipil" },
      { name: "UMPTN", key: "umptn", description: "Latihan ujian masuk perguruan tinggi" },
      { name: "TKA", key: "tka", description: "Tes Kemampuan Akademik" },
      { name: "TPA", key: "tpa", description: "Tes Potensi Akademik" },
      { name: "Try Out", key: "try-out", description: "Latihan ujian" },
      { name: "Latihan Soal", key: "latihan-soal", description: "Latihan soal" },
    ].map((c) => ({ ...c, createdByUserId: adminId }));

    for (const category of categoriesData) {
      const existingCategory = await db
        .select({ id: educationCategories.id })
        .from(educationCategories)
        .where(eq(educationCategories.name, category.name))
        .then((result) => !!result[0]?.id);

      if (!existingCategory) {
        await db.insert(educationCategories).values(category);
      } else {
        await db
          .update(educationCategories)
          .set({
            description: category.description,
            key: category.key,
            createdByUserId: category.createdByUserId,
          })
          .where(eq(educationCategories.name, category.name));
      }
    }
    console.log("✓ Kategori ujian berhasil diinisialisasi.");

    // 2. Initialize Tags
    const tagsData = [
      { name: "Aljabar", description: "Pertanyaan terkait ekspresi dan persamaan aljabar" },
      {
        name: "HOTS",
        description:
          "Pertanyaan Keterampilan Berpikir Tingkat Tinggi (Higher Order Thinking Skills)",
      },
      { name: "Penalaran Numerik", description: "Menguji kemampuan menalar dengan angka" },
      {
        name: "Logika Verbal",
        description: "Pertanyaan yang menganalisis bahasa dan argumen logis",
      },
      {
        name: "Berpikir Kritis",
        description: "Mengevaluasi informasi dan argumen secara sistematis",
      },
    ].map((t) => ({ ...t, createdByUserId: adminId }));

    for (const tag of tagsData) {
      const existingTag = await db
        .select({ id: educationTags.id })
        .from(educationTags)
        .where(eq(educationTags.name, tag.name))
        .then((result) => !!result[0]?.id);

      if (!existingTag) {
        await db.insert(educationTags).values(tag);
      } else {
        await db
          .update(educationTags)
          .set({
            description: tag.description,
            createdByUserId: tag.createdByUserId,
          })
          .where(eq(educationTags.name, tag.name));
      }
    }
    console.log("✓ Tag ujian berhasil diinisialisasi.");

    // 3. Initialize Subjects (Mata Pelajaran Umum)
    // Note: Database schema does not restrict subjects per category,
    // subjects are a global pool of subjects available across different exams.
    const subjectsData = [
      // Umum / Sekolah (Ujian Semester, Kuis, UN)
      { name: "Matematika", description: "Materi matematika umum." },
      { name: "Bahasa Indonesia", description: "Tata bahasa, pemahaman bacaan, dan komunikasi." },
      {
        name: "Bahasa Inggris",
        description: "Reading, Listening, Structure and Written Expression.",
      },
      { name: "Fisika", description: "Ilmu pengetahuan alam mempelajari materi dan energi." },
      { name: "Kimia", description: "Susunan, struktur, sifat, dan perubahan materi." },
      { name: "Biologi", description: "Ilmu tentang kehidupan dan seluk beluk organisme hidup." },
      { name: "Sejarah", description: "Ilmu tentang urutan waktu, asal usul, dan peristiwa lalu." },
      { name: "Geografi", description: "Ilmu tentang ruang dan bumi, iklim, dll." },
      {
        name: "Ekonomi",
        description: "Ilmu tentang asas-asas produksi, distribusi, dan konsumsi.",
      },
      { name: "IPA", description: "Ilmu pengetahuan alam umum." },
      { name: "IPS", description: "Ilmu pengetahuan sosial umum." },

      // UTBK / SNBT Khusus
      { name: "Matematika Dasar", description: "Konsep dasar matematika dan operasi hitung." },
      {
        name: "Matematika Lanjut",
        description: "Materi matematika yang lebih kompleks, kalkulus, dll.",
      },
      {
        name: "Penalaran Matematika",
        description: "Mengukur kemampuan analisis matematis lanjut (UTBK).",
      },
      {
        name: "Literasi dalam Bahasa Indonesia",
        description: "Mengevaluasi pemahaman bacaan tingkat tinggi.",
      },
      {
        name: "Literasi dalam Bahasa Inggris",
        description: "Reading comprehension untuk tes UTBK.",
      },
      { name: "Penalaran Umum", description: "Memecahkan masalah baru berdasarkan pola." },
      {
        name: "Pengetahuan Kuantitatif",
        description: "Tes kemampuan logika dengan angka (Saintek).",
      },

      // CPNS Khusus (SKD)
      {
        name: "Tes Wawasan Kebangsaan (TWK)",
        description: "Penguasaan pengetahuan dan nilai dasar negara.",
      },
      {
        name: "Tes Intelegensia Umum (TIU)",
        description: "Mengukur kemampuan numerik, verbal, figuratif.",
      },
      {
        name: "Tes Karakteristik Pribadi (TKP)",
        description: "Evaluasi perilaku pelayanan publik, adaptasi.",
      },

      // UMPTN / Ujian Masuk Tambahan
      {
        name: "Tes Potensi Skolastik (TPS)",
        description: "Kemampuan kognitif yang untuk keberhasilan studi.",
      },
      {
        name: "Kemampuan Dasar (KD)",
        description: "Tes pengukuran bakat dasar keilmuan yang luas.",
      },
    ].map((s) => ({ ...s, createdByUserId: adminId }));

    for (const subject of subjectsData) {
      const existingSubject = await db
        .select({ id: examSubjects.id })
        .from(examSubjects)
        .where(eq(examSubjects.name, subject.name))
        .then((result) => !!result[0]?.id);

      if (!existingSubject) {
        await db.insert(examSubjects).values(subject);
      } else {
        await db
          .update(examSubjects)
          .set({
            description: subject.description,
            createdByUserId: subject.createdByUserId,
          })
          .where(eq(examSubjects.name, subject.name));
      }
    }
    console.log("✓ Mata Pelajaran (Subjects) berhasil diinisialisasi.");
  } catch (error) {
    console.error(error);
  } finally {
    await pool.end();
  }
}

// Run the seed function with error handling if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seed()
    .then(() => {
      console.log("Database initialization for exam categories completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Database initialization for exam categories failed:", error);
      process.exit(1);
    });
}
