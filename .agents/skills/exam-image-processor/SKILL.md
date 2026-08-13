---
name: exam-image-processor
description: Inspects raw OCR question crop images using vision capabilities, generates student-friendly companion image description markdown files, classifies image complexity (UCDF Chart JSON with Single/Multi-Series vs Simple SVG vs Complex PNG/JPG), and updates question image references. Use after question-splitter and before solution-generator.
license: MIT
---

# Exam Image Vision & SVG Processor Skill

This skill performs vision analysis on cropped question images, extracts visual parameters and tables into a companion markdown file (`imgs/<question_id>.md`), classifies image complexity into 3 tiers, extracts **UCDF Chart JSON (supporting Single & Multi-Series)** for charts, and conditionally generates a clean SVG vector illustration (`imgs/<question_id>.svg`) or a high-quality PNG rendered via **Apache ECharts SSR** (Node/Bun).

## Core Responsibilities

1. **Vision Inspection & 3-Tier Image Classification**:
   - Inspect raw crop images (`imgs/img_in_box_...jpg`).
   - Classify the image into one of three tiers:
     * **Tier 1: Grafik / Chart Standard (UCDF Chart JSON + ECharts SSR PNG/SVG)**: Diagram garis, grafik batang, pie chart, area chart, doughnut, radar chart.
     * **Tier 2: Diagram / Geometri / Vektor Sederhana (SVG)**: Bidang miring, katrol, gerak parabola, geometri, sirkuit listrik sederhana.
     * **Tier 3: Gambar / Foto Komposisi Kompleks (Tetap PNG/JPG Asli)**: Foto anatomi/biologi rumit, peta geografi detail, dokumen sejarah, foto realistis.

2. **Ekstraksi UCDF Chart JSON & Deteksi Multi-Series (Khusus Tier 1)**:
   - Identifikasi apakah chart berupa **Single-Series** atau **Multi-Series** (memuat lebih dari satu kelompok data/warna, misal: *Modal vs Hasil*, *Kelas A vs Kelas B*):
     - `chartType`: `"bar" | "line" | "area" | "pie" | "doughnut" | "radar"`
     - `title`: Judul grafik/chart.
     - `categories`: Array label sumbu-X atau label kategori.
     - `series`: Array objek `{ name, values, color }`. Untuk **Multi-Series**, buat satu objek series per legenda/kelompok warna. **Panjang `values` pada tiap series WAJIB sama dengan panjang `categories`**.
     - `options`: Objek opsi `{ showLegend: true, showGrid: true, stacked: boolean, xAxisLabel, yAxisLabel }`.

3. **Rendering Chart via Apache ECharts SSR (Khusus Tier 1)**:
   - Gunakan **Apache ECharts** dengan Node/Bun SSR (Server-Side Rendering) untuk menghasilkan gambar chart berkualitas tinggi.
   - Alasan memilih ECharts SSR:
     * **Konsistensi 100%**: Visual chart di gambar akan identik dengan chart interaktif di frontend web app SiCerdas (yang juga menggunakan ECharts via `ReactECharts`).
     * **Estetika Modern**: Gradien halus, kurva smooth, tipografi bersih, dan warna ceria tanpa perlu konfigurasi tambahan.
     * **Dukungan Fungsi Matematika**: ECharts mendukung plotting kurva kontinu (fungsi trigonometri, polinomial, eksponensial) dengan fitur `smooth: true` dan sampling data otomatis.
   - Proses:
     1. Baca UCDF JSON dari `imgs/<question_id>.md`.
     2. Konversi UCDF JSON menjadi objek ECharts Option.
     3. Render chart menjadi file PNG (high-DPI @2x) atau SVG.
     4. Simpan ke `imgs/<question_id>.png` atau `imgs/<question_id>.svg`.

4. **Student-Centric Pedagogy**:
   - Explain the diagram in clear, friendly Bahasa Indonesia suitable for students (SD/SMP/SMA/UTBK).
   - Help students visualize what the diagram represents before diving into numbers.

5. **Wajib: Buat File Deskripsi Gambar (`imgs/<question_id>.md`)**:
   - **TETAP BUAT file `.md` untuk SEMUA gambar (Tier 1, Tier 2, maupun Tier 3)**.
   - Format:
     ```markdown
     # Analisis & Deskripsi Gambar: [question_id]

     ## 1. Kategori & Jenis Gambar
     - **Klasifikasi Asset**: [Tier 1: Chart (UCDF + ECharts SSR) | Tier 2: Diagram Sederhana (SVG) | Tier 3: Gambar Kompleks (PNG/JPG)]
     - **Jenis Visual**: [Line Chart / Bar Chart / Diagram Vektor / Foto Biologi / dll.]
     - **Tipe Series**: [Single-Series | Multi-Series (Jumlah Series: N)]

     ## 2. Universal Chart Data (UCDF JSON) - *Khusus Tier 1 Chart*
     ```json
     {
       "chartType": "line",
       "title": "[Judul Chart]",
       "categories": ["Cat1", "Cat2", "Cat3"],
       "series": [
         { "name": "Series 1 (mis. Modal)", "values": [10, 20, 30], "color": "#2563eb" },
         { "name": "Series 2 (mis. Hasil)", "values": [15, 25, 35], "color": "#d97706" }
       ],
       "options": {
         "showLegend": true,
         "showGrid": true,
         "stacked": false,
         "xAxisLabel": "Label X",
         "yAxisLabel": "Label Y"
       }
     }
     ```

     ## 3. Penjelasan Ringkas (Untuk Siswa)
     [Penjelasan naratif ramah siswa mengenai isi diagram/grafik/gambar]

     ## 4. Rincian Data & Nilai Terkstrak
     [Tabel data, koordinat titik, nilai variabel $v_0$, $\theta$, sudut, gaya, dll.]

     ## 5. Elemen Visual & Parameter Diagram
     - **Sumbu X / Komponen Utama**: [Nama sumbu & rentang]
     - **Sumbu Y / Detail Visual**: [Nama sumbu & rentang]
     - **Keterangan Warna & Elemen**: [Keterangan warna, garis, vektor, legenda]

     ## 6. Petunjuk Edit Manual (Khusus SVG)
     [Penjelasan singkat elemen mana di kode SVG yang dapat disesuaikan sendiri]
     ```

6. **Kondisional: Rekreasi Aset Visual**:
   - **Jika Tier 1 (Chart)**:
     - Render chart menggunakan **ECharts SSR** menjadi file PNG high-DPI atau SVG.
     - Untuk Multi-Series Chart, pastikan legenda, warna series, dan label sumbu sesuai UCDF JSON.
     - Simpan ke `imgs/<question_id>.png` atau `imgs/<question_id>.svg`.
   - **Jika Tier 2 (Diagram Sederhana)**:
     - Buat file SVG murni secara manual (kode SVG teks). Pastikan ukuran `viewBox` di-set secukupnya (tight fit) agar tidak ada area putih (white space) berlebih di sekitar konten diagram.
     - Bentuk dasar sederhana (`rect`, `line`, `circle`, `path`) dengan komentar di kode.
     - **Bounding & Padding**: Hitung bounding box aktual seluruh elemen visual terluar, lalu atur `viewBox` agar memiliki **padding simetris yang seragam (contoh: persis 30px)** di keempat sisi (atas, bawah, kiri, kanan). Gunakan elemen `<clipPath>` untuk memotong kurva yang tak berhingga secara rapi.
     - **Penanganan Label & Teks**: Label angka asli ATAU simbol variabel ($v_0$, $\theta$).
     - Pastikan titik koordinat, garis lurus, dan kurva parabola (`Q` Bezier) digambar dengan presisi matematis berdasarkan skala piksel pada sumbu.
     - Garis putus-putus untuk lintasan; marker panah untuk vektor/ukuran.
     - **Gaya Visual & Warna (Penting!)**: Jangan gunakan warna hitam-putih polos. Berikan warna cerah yang berbeda pada **garis utama (interest line)** (misal garis $l$, kurva lintasan, atau objek utama diberi warna biru `#2563eb`, merah `#dc2626`, atau oranye `#ea580c`) agar lebih menonjol dan kontras dibandingkan garis bantu atau sumbu koordinat (yang bisa menggunakan warna abu-abu/hitam). **Label teks yang terkait langsung dengan garis tersebut (misal teks $l$ di ujung garis) juga harus diberi warna yang sama (`fill` warna) dengan garisnya.** Buatlah visual yang ceria dan ramah siswa.
     - Simpan ke `imgs/<question_id>.svg`.
     - **WAJIB**: Setelah file tersimpan, jalankan skrip `python .agents/skills/exam-image-processor/scripts/svg_postprocess.py imgs/<question_id>.svg` untuk mengotomatisasi penambahan efek *halo* teks (`stroke` putih) dan latar belakang `rect`.
   - **Jika Tier 3 (Gambar Kompleks)**:
     - **JANGAN buat SVG atau PNG baru**. Pertahankan file gambar PNG/JPG asli.

7. **Update Question Markdown Reference**:
   - Jika **Tier 1**: Ubah tag gambar menjadi `![chart](imgs/<question_id>.png)` atau `![chart](imgs/<question_id>.svg)`.
   - Jika **Tier 2**: Ubah tag gambar menjadi `![diagram](imgs/<question_id>.svg)`.
   - Jika **Tier 3**: Pastikan tag gambar menunjuk ke file PNG/JPG asli di `imgs/`.

8. **Koreksi & Sinkronisasi Teks Soal (Text-Vision Verification)**:
   - Bandingkan narasi/teks soal pada file `.md` dengan gambar hasil inspeksi vision.
   - Jika terdapat typo OCR, salah baca simbol (misal "garis 1" padahal gambar menunjukkan "Garis $l$"), atau ketidaksesuaian angka/variabel, perbarui teks soal di file `.md` agar konsisten 100% dengan gambar visual dan menggunakan format inline LaTeX yang rapi (misal `$l$`, `$v_0$`).

9. **Deduplikasi Gambar Bersama (Shared Images / Reuse)**:
   - Jika beberapa soal merujuk pada gambar asli (crop OCR) yang sama (misalnya soal 421, 422, dan 423 menggunakan `img_in_box_XXX.jpg` yang sama), **JANGAN** membuat duplikat aset (seperti `422.svg` dan `423.svg`) atau file deskripsi (`422.md`, `423.md`).
   - Buat hanya **satu** set aset menggunakan ID soal pertama dalam grup (misal: `421_q421.svg` dan `421_q421.md`).
   - Perbarui referensi Markdown pada soal-soal lainnya (422 dan 423) agar menunjuk ke aset tunggal tersebut (misal `![diagram](imgs/421_q421.svg)`).
   - Ini bertujuan mengoptimalkan ruang penyimpanan dan menghindari pembuatan berulang untuk gambar yang persis sama.
