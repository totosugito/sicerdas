# Quality Rules & Formatting Guidelines

## Bahasa Indonesia Requirements

- Semua teks output harus dalam **Bahasa Indonesia baku** sesuai **EYD** (Ejaan yang Disempurnakan).
- Gunakan kalimat yang jelas dan lugas, sesuai untuk pelajar sekolah.
- Hindari bahasa informal, slang, atau campuran bahasa Inggris yang tidak perlu.

## Dynamic Variables (Soal Komputasi)

Jika soal melibatkan perhitungan atau fungsi matematika, Anda **WAJIB** membuat soal menjadi dinamis:

1. **Jangan hardcode angka (koefisien, basis, nilai)**. Pindai angka-angka konstan di soal (seperti basis $2020$, fungsi $f(2)$) dan ubah menjadi placeholder `{{a}}`, `{{b}}`, dst.
2. Tempatkan placeholder ini **di dalam** prop `latex` (contoh: `\log_{{{a}}} ({{b}}x - {{c}})` atau `f({{x_val}})`).
3. Isi `variableFormulas.variables` dengan **3–5 set angka** yang realistis. Pastikan himpunan angka tetap memenuhi syarat matematis (contoh: basis logaritma harus positif dan bukan 1, nilai dalam logaritma harus positif).
4. Pastikan untuk memasukkan perhitungan nilai opsi yang salah/pengecoh (`opt1`, `opt2`, dst.) ke dalam array variables.
5. Masukkan rumus turunan jawaban ke `variableFormulas.solutions` menggunakan ekspresi matematika murni tanpa kurung kurawal (contoh: `"b * x_val - c"` atau `"a + b"`). JANGAN gunakan kurung kurawal mustache seperti `"{{b}} * {{x_val}} - {{c}}"` karena akan menyebabkan `SyntaxError` pada evaluator rumus.

Hanya jika soal murni TEORI (misal: "Siapa penemu gaya gravitasi?"), baru Anda boleh menset `variableFormulas: null`.

Jika soal TIDAK melibatkan perhitungan (teori, konsep), set `variableFormulas: null`.

## Gaya Bahasa (Tone) & Pedagogi

Anda **WAJIB** menggunakan gaya bahasa yang ramah, natural, dan mengalir, layaknya seorang guru yang sedang menjelaskan kepada siswanya di kelas.
- **Penjelasan Mendetail (Detail-Oriented)**: Jangan hanya memberikan instruksi matematis singkat ("Substitusikan..."). Jelaskan *alasan* di balik langkah tersebut. Jika menggunakan sifat logaritma, jelaskan penerapannya pada angka yang ada (contoh: *"Ada sifat logaritma yang menyatakan $a^{\log_a b} = b$. Karena basis eksponen dan logaritmanya sama-sama 2020, persamaannya menjadi jauh lebih sederhana..."*).
- **HINDARI** bahasa yang kaku, seperti terjemahan mesin, atau terlalu formal (contoh buruk: *"Karena itu, langsung hitung bagian dalam logaritma"*).
- **Gunakan transisi yang luwes** (contoh baik: *"Dari persamaan di atas, kita bisa melihat bahwa..."*, *"Nah, sekarang kita tinggal mensubstitusikan nilai x..."*).

## Options Formatting & Scoring Logic

1. **Format Opsi Angka/Rumus:** Jika opsi jawaban berupa angka, variabel, atau rumus, opsi tersebut **HARUS** diformat menggunakan blok `paragraph` yang berisi objek inline `latex` (`displayMode: false`), BUKAN sebagai blok `equation`. Blok `equation` membuat opsi menjadi full-width yang merusak tata letak (UI).

| Type | maxScore | Option scoring |
|------|----------|---------------|
| `multiple_choice` | `1` | Jawaban benar: `score: 1`. Lainnya: `score: 0`. |
| `multiple_select` | Total opsi benar | Setiap opsi benar: `score: 1`. Salah: `score: 0`. |
| `essay` | Sesuai rubrik (misal `5`) | Tidak ada opsi. Rubrik poin di solusi harus berjumlah tepat = maxScore. |
| `statement_reasoning` | `1` | Hanya 2 opsi: "Benar" (order 1) dan "Salah" (order 2). |

## Statement Reasoning (Pernyataan-Sebab)

Jika format sumber berisi `"Pernyataan SEBAB Alasan"`:

1. Teks SEBELUM "SEBAB" → masuk ke field `content`.
2. Teks SESUDAH "SEBAB" → masuk ke field `reasonContent`.
3. **JANGAN** sertakan kata "SEBAB" di kedua field.
4. Solusi harus menganalisis KEDUA bagian secara terpisah:
   - Paragraf 1: `"Pernyataan BENAR/SALAH: "` (bold) + penjelasan (normal)
   - Paragraf 2: `"Alasan BENAR/SALAH: "` (bold) + penjelasan (normal)

## Solutions (Pembahasan) — SANGAT PENTING

Pembahasan ini untuk **anak sekolah**. Harus **lengkap, berurutan, dan mudah dipahami**.

### Struktur Wajib untuk Soal Hitungan

```
Solusi 1 (solutionType: "general"):
  Paragraf 1: "Diketahui:" (bold)
  [Blok "bulletListItem"]: Gunakan list berpoin ke bawah untuk setiap variabel/rumus yang diketahui. Jangan gabung dalam satu baris paragraf panjang.
  Paragraf 2: "Ditanya:" (bold) + apa yang ditanyakan (boleh sebaris)
  Paragraf 3: "Pembahasan:" (bold) (HARUS berdiri sendiri sebagai paragraf tunggal)
  Paragraf 4: Kalimat pengantar pembahasan (berada di baris baru di bawah label).
  
  [Blok "alert" type "tip" (Opsional)]: Hanya berisi poin singkat atau rumus (misal: "Ingat Sifat Logaritma: ..."). Gunakan tipe "tip" agar muncul ikon bohlam/lampu kuning yang cocok untuk sifat/rumus. JANGAN menambahkan emoji seperti 💡 karena UI sudah memiliki icon otomatis. JANGAN menaruh kalimat penjelasan panjang atau gaya percakapan di dalam blok alert. Letakkan penjelasan di paragraf biasa.
  
  [Blok "numberedListItem"]: Gunakan ini untuk SELURUH tahapan langkah. 
  - JANGAN menulis kata "Langkah pertama", "Langkah 1", atau "1. " di dalam teks string karena nomor sudah di-render otomatis oleh badge list item.
  - WAJIB menaruh blok turunan seperti `equation` dan `alert` di dalam array `children` dari `numberedListItem` ini agar urutan nomor (1, 2, 3...) tetap menyambung dan tidak terputus/ter-reset.
  
  [Blok "equation"]: Gunakan untuk perhitungan matematika. JIKA di dalam langkah bernomor, WAJIB diletakkan di dalam properti `children` dari blok langkah tersebut. **PENTING:** Jika perhitungan terdiri dari beberapa tahap penyederhanaan, JANGAN ditulis menyamping panjang. Wajib gunakan environment LaTeX `\begin{aligned} ... \end{aligned}`.
  
  Paragraf terakhir (BERLAKU UNTUK SEMUA JENIS SOLUSI): Wajib ditutup dengan kalimat persis seperti ini: `"Jadi, jawaban yang benar adalah [hasil]."` (Gunakan inline latex atau bold untuk hasil). JANGAN gunakan variasi aneh seperti "jawaban cepatnya", "maka hasilnya", dll. JANGAN PERNAH menyebutkan huruf opsi seperti "opsi D" karena opsi akan diacak.

Solusi 2 (solutionType: "fast_method") — OPSIONAL:
  Hanya jika ada cara cepat yang valid.
  Paragraf 1: [Blok "alert" type "success"] Berisi nama trik/rumus singkat.
  Paragraf 2: [Blok "paragraph"] **WAJIB ADA PENJELASAN.** Jelaskan secara naratif bagaimana rumus tersebut dipakai di soal ini sebelum memberikan hitungan. JANGAN lompat langsung dari alert ke blok equation matematika.
  Paragraf 3: [Blok "equation"] Perhitungan matematis (gunakan `\begin{aligned}` jika lebih dari satu langkah).
  Paragraf 4: "Jadi, jawaban yang benar adalah [hasil]."
```

### Aturan Bold

- **HANYA** label yang di-bold (`"Diketahui:"`, `"Ditanya:"`, `"Jawaban:"`)
- **JANGAN PERNAH** bold seluruh paragraf
- Pisahkan label dan penjelasan menjadi dua objek `text` terpisah:

```json
[
  {"type": "text", "text": "Diketahui: ", "styles": {"bold": true}},
  {"type": "text", "text": "massa benda m = 5 kg, percepatan gravitasi ...", "styles": {}}
]
```

## Plausible Distractors (Pengecoh)

Untuk `multiple_choice` dan `multiple_select`, opsi salah **HARUS masuk akal**:
- Hasil dari kesalahan umum siswa (salah operasi, lupa konversi satuan)
- Hasil dari langkah yang hampir benar tapi salah di satu titik
- **BUKAN** angka acak yang jelas salah

## Tags (Kategorisasi)

- 1–3 tag per soal, dalam Bahasa Indonesia
- Gunakan tag umum/luas, bukan terlalu spesifik
- Contoh baik: `"Trigonometri"`, `"Logaritma"`, `"Kinematika"`, `"Bangun Ruang"`
- Contoh buruk: `"Soal Nomor 3 Halaman 45"`

## Anti-Hallucination

1. Jika teks/simbol tidak terbaca → tulis `[UNREADABLE]`.
2. Jika soal bisa diekstrak tapi **tidak bisa diselesaikan dengan yakin** → tetap buat JSON, tapi `solutions: []` dan semua opsi `isCorrect: false`.
3. Jika soal sama sekali tidak bisa dipahami → kembalikan pesan teks biasa, jangan buat JSON palsu.

## Clean Extraction

- Hapus nomor soal dari sumber (`"1."`, `"Soal 5:"`, dll.)
- Hapus wrapper LaTeX `$` dan `$$` — masukkan LaTeX mentah ke prop `latex`
- Jaga pemisahan antara teks dan ekspresi math
