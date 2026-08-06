---
name: markdown-question-splitter
description: Memecah satu file markdown yang berisi banyak soal menjadi file-file kecil yang masing-masing hanya berisi satu soal. Gunakan skill ini sebelum memanggil exam-question-generator pada file sumber yang panjang.
---

# Markdown Question Splitter Skill

Skill ini bertugas membaca satu file sumber `.md` yang berisi banyak soal, mendeteksi batas setiap soal, dan memecahnya menjadi file-file mandiri agar lebih mudah (dan lebih akurat) untuk diproses oleh LLM di tahap selanjutnya.

## Workflow

### Step 1 — Analisis Input
1. Baca file sumber `.md` yang diberikan oleh pengguna menggunakan `view_file`.
2. Pahami struktur dan pola file tersebut. Batas antar soal biasanya ditandai oleh:
   - Penomoran standar angka (`1. `, `2. `) di awal baris.
   - Teks pertanyaan yang diakhiri oleh blok opsi jawaban berderet (`(A)`, `(B)`, `(C)`, `(D)`, `(E)`).
   - Teks "Soal No. X".

### Step 2 — Ekstraksi
1. Pisahkan teks secara hati-hati berdasarkan batas soal yang telah diidentifikasi.
2. Pastikan SETIAP potongan soal mandiri yang diekstrak memuat:
   - Teks pertanyaan secara utuh.
   - Semua opsi jawaban (jika ada).
   - Referensi gambar (contoh: `![gambar](img.jpg)`) atau tabel yang mendampingi soal tersebut.
3. **CRITICAL - Konteks Wacana Bersama:** Jika di dalam file sumber terdapat narasi panjang/wacana teks yang dipakai untuk beberapa soal berurutan (misal: *"Untuk soal no 1-3, perhatikan cerita berikut..."*), Anda **WAJIB** menyalin dan menyisipkan teks wacana tersebut ke bagian atas masing-masing file (soal 1, soal 2, dan soal 3). Jangan biarkan sebuah soal kehilangan teks rujukan utamanya karena terpisah dari soal sebelumnya.
4. **CRITICAL - Update Path Gambar:** Karena file hasil pecahan disimpan di subfolder `ori/` (satu level lebih dalam dari file sumber), semua path gambar relatif di dalam teks markdown **WAJIB** di-update agar tetap menunjuk ke lokasi yang benar. Tambahkan prefix `../` pada setiap path gambar relatif.
   - **Contoh:** `imgs/img_chart.jpg` → `../imgs/img_chart.jpg`
   - **Contoh:** `![diagram](gambar.png)` → `![diagram](../gambar.png)`
   - **Contoh:** `<img src="imgs/fig1.jpg" ...>` → `<img src="../imgs/fig1.jpg" ...>`
   - **JANGAN** ubah path yang sudah absolut (dimulai dengan `/` atau `http`).

### Step 3 — Penyimpanan Otomatis (Output Location)
1. Simpan semua file pecahan secara terpusat ke dalam folder bernama `ori/` yang berada di direktori yang sama dengan file sumber. (Jangan membuat sub-folder baru untuk tiap-tiap file).
   - **Contoh:** Jika file sumber adalah `/home/toto/Documents/sicerdas/test/page_01.md`, maka lokasi ekstraksinya wajib disimpan di `/home/toto/Documents/sicerdas/test/ori/`.
2. Simpan setiap soal yang telah diekstrak ke dalam folder `ori/` tersebut menggunakan `write_to_file`.
   - **Aturan Nama File:** Ambil angka pengidentifikasi dari nama file sumber asli (misal `page_01.md` -> `01`), lalu gabungkan dengan nomor urut soal. Formatnya: `<ID_file>_q<no_soal>.md`.
   - **Contoh Nama File:** Jika input `page_01.md`, maka hasil pemecahannya bernama `01_q01.md`, `01_q02.md`, `01_q03.md`, dst. Jika nama file aslinya tidak mengandung angka (misal `soal.md`), gunakan nama aslinya menjadi `soal_q01.md`.

### Step 4 — Laporan (Report)
1. Setelah seluruh file disimpan, tampilkan laporan singkat.
2. Laporan memuat:
   - Path/Lokasi folder tempat file-file pecahan disimpan.
   - Total jumlah soal yang berhasil diekstrak.
   - Rekomendasi langkah selanjutnya (mengingatkan user untuk memproses isi folder split tersebut menggunakan `exam-question-generator`).

## Keselamatan (Safety)
- **JANGAN** pernah memodifikasi (edit/overwrite) atau menghapus file sumber `.md` aslinya.
- Jika teks nomor soal acak-acakan (misal loncat dari 3 ke 5 akibat typo di sumber), buang saja angka nomor soal aslinya di teks pecahan, karena penamaan file `q04.md` sudah mewakili urutannya.
