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