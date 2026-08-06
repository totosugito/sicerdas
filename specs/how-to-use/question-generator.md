## Sample to generate question
```bash
# Gunakan skill `exam-question-generator`
## Folder Input

`@005/`

## Instruksi

1. Gunakan **Folder Input** sebagai direktori kerja.
2. Baca seluruh file dengan ekstensi `*.md` yang ada di dalam Folder Input.
3. Cari **soal dengan nomor 1** di seluruh file Markdown, lalu proses **hanya soal tersebut**.
4. Buat folder `exam/` di dalam Folder Input jika belum ada.
5. Simpan hasil ke dalam folder `exam/` menggunakan format JSON lengkap sesuai output dari skill `exam-question-generator`. JSON harus memuat seluruh informasi yang tersedia, termasuk:

   * pertanyaan
   * pilihan jawaban (jika ada)
   * jawaban benar
   * pembahasan atau solusi
   * metadata lainnya
6. Setiap file JSON hanya boleh berisi **satu pertanyaan**.
7. Gunakan **nomor soal** sebagai nama file dengan format tiga digit, misalnya:

   * `exam/001.json`
8. Jika file tujuan sudah ada, **timpa (overwrite)** file tersebut.
9. Setelah `exam/001.json` berhasil dibuat, hentikan proses. Jangan memproses atau membuat file JSON untuk soal lainnya.

```

## Process all
```bash
# Gunakan skill `exam-question-generator`

## Folder Input

`@006/` ke `@010/`

## Instruksi

1. Gunakan **Folder Input** sebagai direktori kerja.
2. Tidak perlu membuat script untuk mengekstrak konten markdown dari file *.md. Dibaca manual saja karena pemisah tiap soal tidak standard dan kadang lanjutan soal ada di file markdown selanjutnya.
3. Baca seluruh file dengan ekstensi `*.md` yang ada di dalam Folder Input.
4. Temukan seluruh soal yang terdapat pada semua file Markdown.
5. Abaikan soal jika memiliki `img` pada bagian pertanyaan. Sebab untuk saat ini belum bisa handle soal dengan gambar.
6. Buat folder `exam/` di dalam Folder Input jika belum ada.
7. Proses setiap soal menggunakan **skill `exam-question-generator`**.
8. Untuk setiap soal:

   * hasilkan satu file JSON lengkap sesuai format output dari skill `exam-question-generator`;
   * JSON harus memuat seluruh informasi yang tersedia, termasuk:

     * pertanyaan;
     * pilihan jawaban (jika ada);
     * jawaban benar;
     * pembahasan atau solusi;
     * metadata lainnya.
9. Setiap file JSON hanya boleh berisi **satu pertanyaan**.
10. Gunakan **nomor soal** sebagai nama file dengan format tiga digit. Contoh:

   * `exam/001.json`
   * `exam/002.json`
   * `exam/003.json`
11. Simpan seluruh file JSON ke dalam folder `exam/`.
12. Jika file tujuan sudah ada, timpa (overwrite) file tersebut.
13. Ulangi proses hingga seluruh soal pada seluruh file Markdown selesai diproses.
14. Setelah semua soal selesai diproses, tampilkan ringkasan yang berisi:

    * jumlah file Markdown yang diproses;
    * jumlah soal yang berhasil dikonversi;
    * jumlah file JSON yang dibuat;
    * daftar soal yang gagal diproses (jika ada) beserta penyebabnya.
```


## Image svg generator
### template umum
```bash
Ubah gambar terlampir menjadi ilustrasi SVG sederhana untuk soal sekolah
mapel [FISIKA/MATEMATIKA/IPA] tingkat [SD/SMP/SMA].

Ketentuan:
- Keluaran berupa KODE SVG (teks), bukan gambar raster. Gunakan viewBox ± 500x300.
- Gambar tidak harus identik dengan aslinya; yang penting semua informasi
  soal tersampaikan (objek, panah, lintasan, label).
- Pakai bentuk dasar sederhana (rect, line, circle, path) dan beri komentar
  pendek di kode untuk tiap bagian.
- Label: [pilih: pertahankan angka seperti asli | ganti angka dengan simbol
  (mis. v₀, θ, h, x) untuk versi latihan].
- Gaya: [pilih: berwarna ceria ramah anak | hitam-putih hemat tinta untuk fotokopi].
- Garis putus-putus untuk lintasan/garis acuan; panah berkepala (marker) untuk
  vektor dan ukuran jarak.
- Setelah kode, jelaskan singkat bagian mana yang bisa saya edit sendiri.
```

### Contoh use case
```bash
Gambar terlampir adalah diagram gerak parabola dari atas gedung. Ubah menjadi
ilustrasi SVG sederhana untuk latihan siswa SMP/SMA.

Ketentuan:
- Keluaran kode SVG, viewBox 500x300.
- Versi latihan: JANGAN pakai angka. Ganti dengan simbol: v₀ (kecepatan awal),
  θ (sudut elevasi), h (tinggi gedung), x (jarak mendatar).
- Berwarna ceria: langit biru muda + matahari, gedung biru berjendela,
  lintasan oranye bintik-bintik, panah kecepatan merah, sudut ungu,
  panah jarak hijau toska, tanah cokelat dengan arsiran.
- Elemen wajib: gedung, tanah, panah vektor kecepatan + busur sudut,
  garis horizontal acuan putus-putus, lintasan parabola bintik-bintik,
  bola di titik jatuh, panah dua arah untuk x dan untuk h.
- Gambar tidak harus sama persis, tujuan tercapai.
```