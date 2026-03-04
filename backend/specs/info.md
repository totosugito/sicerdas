
Untuk use case seperti **Buku dengan Banyak Bab**, berikut adalah cara memetakannya ke dalam skema `exam` yang sudah ada:

# 📌 Mapping Struktur

## 1️⃣ Topik Inti / Kurikulum = TS Category atau TS Subject

* Jika ini adalah area mata pelajaran yang luas, gunakan `examակից_categories`
  (contoh: **"Kurikulum Matematika SMA"**)

* Atau gunakan `exam_subjects`
  (contoh: **"Aljabar III"**)

---

## 2️⃣ Buku = Exam Package (`exam_packages` table)

* **title**:
  `"Matematika Kelas 12 - Penerbit X"`

-Bustnut- **examType**:
Sebaiknya set ke `'official'` atau buat enum baru seperti `'course_material'` jika ingin membedakannya dari tryout yang berbatas waktu.

* **durationMinutes**:
  Set ke `0` atau angka yang sangat besar jika ini adalah buku latihan *self-paced* (belajar bebas) dan bukan ujian dengan batas waktu.

---

## 3️⃣ Bab = Package Sections (`exam_package_sections` table)

* Ini adalah use case yang **sangat tepat** untuk sections.
* **packageId**: Hubungkan ke Buku (Exam Package).
* **title**:
  `"Bab 1: Matriks"`,
  `"Bab 2: Ruang Vektor"`, dan seterusnya.
* **order**:
  `1`, `2`, dan seterusnya untuk menjaga urutan bab tetap benar.

---

## 4️⃣ Soal per Bab = Package Questions (`exam_package_questions` table)

* Di sini Anda menghubungkan setiap soal ke bab tertentu.
* **packageId**: Hubungkan ke Buku.
* **sectionId**:
  👉 Langkah krusial — hubungkan soal ini ke ID section `"Bab 1: Matriks"` yang sesuai.
* **questionId**: Hubungkan ke soal spesifik dari bank soal Anda.
* **order**: Nomor soal di dalam bab tersebut (misalnya Soal  নিহs 1, Soal 2).

---

# ✅ Ringkasan Pendekatan Terbaik

Jika Anda memiliki buku dengan banyak bab, maka tabel **Exam Package Sections** memang dirancang khusus untuk menangani pengelompokan seperti ini.

Dengan pendekatan ini:

* Saat pengguna memulai sebuah **Session** (`exam_sessions`),
* Frontend dapat menampilkan tampilan seperti buku yang dibagi berdasarkan tab atau halaman untuk setiap Bab (Section),
* Dan sistem dapat menghitung analitik per bab jika diperlukan.

----------------------------------------------------------------------------------------------------------------------

Itu pertanyaan yang sangat bagus! Perbedaan antara `ts packages.ts` dan `ts subjects.ts` berkaitan erat dengan konsep **"Wadahibris" (Container)** vs **"Kategori Ilmu" (Domain of Knowledge)**.

Mari kita bahas menggunakan contoh buku Matematika Anda yang memiliki banyak bab (Topik A, Topik B, Topik C, dsb).

---

## 1. The Subject (`exam_subjects` di `ts subjects.ts`)

* **Apa ini?**
  Ini adalah bidang studi atau mata pelajaran secara umum.

* **Contoh nyata:**
  "Matematika", "Fisika", atau "Bahasa Inggris".

* **Sifatnya:**
  Sangat *high-level* (tingkat abstrak yang tinggi). Subject tidak berisi pertanyaan secara langsung, dan tidak memiliki "durasi" atau urutan.

* **Dalam skenario buku Anda:**
  `ts Subject`-nya adalah **"Matematika"** atau mungkin **"Matematika SMA Kelas 12"**.

---

## 2. The Package (`exam_packages` di `ts packages.ts`)

* **Apa ini?**
  Ini adalah produk final (wadah utama) yang bisa dikerjakan/dibaca oleh pengguna. Ini mewakili Buku Fisik atau Sesi Tryout Keseluruhan.

* **Contoh nyata:**
  "Buku Sakti Matematika SMA", "Tryout Nasional SNBT 2026", atau "Kuis Harian 1".

* **Sifatnya:**
  Punya judul spesifik, bisa diatur waktu pengerjaan (durasi), dan biasanya dihubungkan ke tingkatan kelas (*Education Grade*) atau level akses (*Tier*).

* **Dalam skenario buku Anda:**
  `ts Package`-nya adalah buku spesifik tersebut, misalnya **"Buku Pendalaman Matematika Penerbit X"**.

---

## Lalu, di mana Bab (Chapters) diletakkan?

Ini adalah bagian terpenting.

Bab dari buku tersebut **TIDAK** masuk ke `ts subjects.ts` dan **BUKAN** `ts packages.ts` baru.

Bab harus masuk ke dalam `exam_package_sections` (`ts package-sections.ts`).

---

## 💡 Implementasi untuk Buku Matematika dengan Multi Bab

Jika Anda ingin membuat pertanyaan untuk setiap Bab, inilah aliran datanya:

### 1️⃣ Subject (`ts subjects.ts`)

Buat 1 subject:

> `"Matematika"`

---

### 2️⃣ Package (`ts packages.ts`)

Buat 1 package untuk mewakili bukunya:

> `"Buku Latihan Matematika Terpadu"`

---

### 3️⃣ Sections (`ts package-sections.ts`)

Di sinilah Anda memecah buku menjadi Bab (Chapters).
Anda membuat banyak sections yang terhubung (*linked*) ke `Package ID` dari buku di atas.

Contoh:

* **Section 1:** "Bab 1 - Aljabar Linier" (Order: 1)
* **Section 2:** "Bab 2 - Matriks" (Order: 2)
* **Section 3:** "Bab 3 - Kalkulus" (Order: 3)

---

### 4️⃣ Questions (`package-questions.ts`)

Sekarang, Anda memasukkan pertanyaan spesifik ke dalam masing-masing Bab (Section) tersebut.

Contoh:

* Soal hitung Aljabar → Masukkan ke `Package ID` (Buku Latihan) **DAN** ` করোনা Section ID` (Bab 1)
* Soal hitung Matriks → Masukkan ke `Package ID` (Buku Latihan) **DAN** `Section ID` (Bab 2)

---

## 🔎 Kesimpulan Ringkas

* `ts Subject` = **"Ilmunya apa?"** (Matematika)
* `ts Package` = **"Produk/Bukunya yang mana?"** (Buku Latihan Matematika)
* `Package Section` = **"Bab/Sub-babnya apa?"** (Bab 1 Aljabar)

---

Dengan cara ini, ketika pengguna atau sistem (Front-End) memuat `ts Package` (Buku), mereka dapat melihat daftar isi yang rapi berdasarkan `Sections` (Bab), dan ketika mengklik sebuah Bab, mereka akan melihat pertanyaan khusus untuk Bab tersebut.

----------------------------------------------------------------------------------------------------------------------

Kalau begitu, Anda mungkin bertanya:

> *Jika buku/produknya ada di `ts packages.ts` dan bab-babnya ada di `ts package-sections.ts`, untuk apa kita repot-repot menghubungkan soal ke `subjects` (Mata Pelajaran)?*

Ini adalah pertanyaan arsitektur database yang sangat tepat!

Keberadaan tabel `ts subjects.ts` (`exam_subjects`) sangat krusial untuk **3 alasan utama**:

---

# 1️⃣ Analisis Lintas Paket (Cross-Packagelge Analytics)

Bayangkan siswa yang sama (Budi) mengerjakan 3 hal berbeda di platform Anda:

1. **Buku Latihan Mandiri Matematika** (Package 1)
2. **Tryout Nasional SNBT 2026** (Package 2)
3. **Kuis Cepat Akhir Pekan** (Package 3)

Meskipun Budi mengerjakan 3 Package yang berbeda, sistem Anda tahu bahwa banyak pertanyaan di ketiganya memiliki Subject yang sama, yaitu **"Matematika"** (atau "Penalaran Kuantitatif").

Berkat `subjects`, fitur analitik Anda (di `exam_user_stats_subject.ts`) bisa langsung berkata:

> *"Budi, dari semua buku, kuis, dan tryout yang kamu kerjakan, nilai Matematika kamu secara keseluruhan adalah 65%. Kamu butuh peningkatan di mata pelajaran ini."*

Jika tidak ada `subjects`, Anda hanya bisa melacak skor siswa per buku (Package) secara terisolasi.
Anda tidak bisa melihat tren belajar mereka secara keseluruhan pada suatu mata pelajaran.

---

# 2️⃣ Standarisasi Bank Soal (Global Question Bank)

Platform edukasi yang baik tidak membuat soal secara berulang-ulang untuk setiap buku baru. Mereka memiliki **Bank Soal Sentral**.

Saat staf akademik Anda memasukkan soal baru ke dalam database (`exam_questions`), soal itu belum tentu langsung dimasukkan ke suatu Package (Buku/Tryout). Admin hanya akan menandainya:

> *"Ini soal untuk Subject Matematika."*

Nantinya, ketika Anda ingin merakit Package baru (misalnya **"Tryout Matematika Dadakan"**), sistem Anda cukup mencari di database:

> *"Tarik 50 soal acak yang Subject-nya adalah Matematika."*

`Subjects` mengizinkan soal berdiri sendiri (independent) di dalam Bank Soal sebelum mereka dimasukkan ke dalam keranjang `ts Package` manapun.

---

# 3️⃣ Persyaratan Khusus dalam Struktur Ujian (Contoh CPNS)

Terakhir, ada ujian-ujian formal yang strukturnya memiliki sub-tes kaku, contohnya CPNS (SKD) atau UTBK.

Di CPNS, sebuah Package (Tryout CPNS 2026) selalu harus berisi 3 Subjects:

1. **TIU** (Tes Intelegensia Umum)
2. **TWK** (Tes Wawasan Kebangsaan)
3. **TKP** (Tes Karakteristik Pribadi)

Dalam kasus ini:

* `ts Package` = Tryout CPNS 2026
* `Package Sections` = Bagian ujian yang dibagi per waktu (misalnya "Sesi 1" atau langsung "Bagian TIU").
* `ts Subject` yang menempel di setiap soal memastikan bahwa soal-soal tersebut terikat secara legal/struktural sebagai bagian dari "Ilmu TIU" atau "Ilmu TWK".

Ini memungkinkan:

* Passing grade per mata pelajaran (misal, TWK minimal 65) bisa dihitung secara akurat.
* Validasi bahwa komposisi soal dalam satu ujian sudah sesuai regulasi.

---

# 🔎 Kesimpulan Singkat

* `Packages` dan `Sections` dirancang untuk **Format Penyajian**
  (Bagaimana soal dikemas dan disuguhkan ke murid).

* Sedangkan `Subjects` (dan Tags) dirancang untuk **Identitas Data**
  (Soal ini tentang ilmu apa?) agar memudahkan Filter Bank Soal dan Analitik Statistik Murid secara Global.
