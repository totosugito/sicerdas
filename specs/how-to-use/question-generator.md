## Step 1: Split soal (pecah file multi-soal)
```bash
# Gunakan skill `markdown-question-splitter`

## Folder Input

`@test`

## Instruksi

1. Gunakan **Folder Input** sebagai direktori kerja.
2. Baca seluruh file dengan ekstensi `*.md` yang ada di dalam Folder Input (kecuali file di dalam subfolder `ori/` dan `exam/`).
3. Untuk setiap file `.md` yang ditemukan, pecah menjadi file-file kecil yang masing-masing berisi **satu soal** menggunakan skill `markdown-question-splitter`.
4. Hasil pecahan akan otomatis disimpan ke folder `ori/` di dalam Folder Input.
5. Ulangi hingga seluruh file `.md` di Folder Input selesai dipecah.
```

## Step 2: Generate JSON (proses per soal)
```bash
# Gunakan skill `exam-question-generator`

## Folder Input

`@test`

## Instruksi

1. Gunakan **Folder Input** sebagai direktori kerja.
2. Baca seluruh file dengan ekstensi `*.md` yang ada di dalam subfolder `ori/` pada Folder Input. Setiap file berisi **satu soal** (hasil pecahan dari Step 1).
3. Jika soal memiliki gambar (misal JPG/PNG), cari file .svg dengan nama yang sama di direktori tersebut. Jika .svg ditemukan, proses soal tersebut. Jika .svg tidak ada, baru abaikan/skip.
4. Buat folder `exam/` di dalam Folder Input jika belum ada.
5. Proses setiap soal menggunakan **skill `exam-question-generator`**.
6. Untuk setiap soal:

   * hasilkan satu file JSON lengkap sesuai format output dari skill `exam-question-generator`;
   * JSON harus memuat seluruh informasi yang tersedia, termasuk:

     * pertanyaan;
     * pilihan jawaban (jika ada);
     * jawaban benar;
     * pembahasan atau solusi;
     * metadata lainnya.
7. Setiap file JSON hanya boleh berisi **satu pertanyaan**.
8. Nama file JSON output **sama dengan nama file input `.md`** (ganti ekstensi saja). Contoh:

   * `ori/01_q01.md` → `exam/01_q01.json`
   * `ori/01_q02.md` → `exam/01_q02.json`
   * `ori/02_q01.md` → `exam/02_q01.json`
9. Simpan seluruh file JSON ke dalam folder `exam/`.
10. Jika file tujuan sudah ada, timpa (overwrite) file tersebut.
11. Ulangi proses hingga seluruh soal pada seluruh file Markdown di `ori/` selesai diproses.
12. Setelah semua soal selesai diproses, tampilkan ringkasan yang berisi dalam bentuk file log format markdown yang disimpan di folder "Folder Input" dengan nama `summary.md`:

    * jumlah file Markdown yang diproses;
    * jumlah soal yang berhasil dikonversi;
    * jumlah file JSON yang dibuat;
    * daftar soal yang gagal diproses (jika ada) beserta penyebabnya.
```