# 🔧 Text Input Fixer Skill

Skill untuk membersihkan dan memperbaiki file teks/markdown yang mengandung typo, karakter rusak, artefak OCR, dan masalah formatting — terutama untuk file soal ujian dalam Bahasa Indonesia sebelum diproses oleh `exam-question-generator`.

## Cara Penggunaan

### 1. Siapkan File yang Bermasalah

File `.md` atau `.txt` yang mengandung masalah seperti:
- Karakter aneh/mojibake (`â€"`, `Â±`, `Ã—`)
- Hasil OCR yang salah (`1ogaritma`, `rnenentukan`, `4O`)
- Typo Bahasa Indonesia (`berarkah`, `penjumlhan`, `logritma`)
- LaTeX yang rusak (`\frac x y`, `sqrtx`, kurung kurawal tidak cocok)
- Format opsi tidak konsisten (`a)`, `A.`, `(A)`)

### 2. Trigger Skill di Chat

Ketik salah satu perintah berikut:

```
Fix teks di @[path/to/soal.md]
```

```
Perbaiki typo dan karakter rusak di @[file.md]
```

```
Clean up markdown @[soal-fisika.md] sebelum generate questions
```

**Kata kunci trigger:** `fix text`, `perbaiki teks`, `clean up`, `fix typos`, `fix encoding`, `normalize input`, `bersihkan markdown`

### 3. Output

Skill akan menghasilkan:
- ✅ File yang sudah diperbaiki (overwrite atau file baru)
- ✅ **Fix report** — ringkasan semua perbaikan yang dilakukan
- ⚠️ Flag `[REVIEW]`, `[UNREADABLE]`, atau `[BROKEN_LATEX]` untuk item yang perlu dicek manual

### 4. (Opsional) Lanjut ke Exam Generator

Setelah teks diperbaiki, Anda bisa langsung melanjutkan ke `exam-question-generator` untuk mengonversi soal ke format JSON BlockNote.

## Kategori Perbaikan

| Kategori | Contoh Perbaikan |
|----------|-----------------|
| **Encoding & Mojibake** | `â€"` → `—`, `Â±` → `±`, hapus invisible characters |
| **OCR Artifacts** | `1ogaritma` → `logaritma`, `rn` → `m`, reconnect broken words |
| **Typo Bahasa Indonesia** | `berarkah` → `berapakah`, `penjumlhan` → `penjumlahan` |
| **LaTeX** | `\frac x y` → `\frac{x}{y}`, `sqrtx` → `\sqrt{x}` |
| **Markdown Structure** | `a)` → `(a)`, spacing, hapus page numbers |

## Struktur Skill

```
text-input-fixer/
├── SKILL.md                    # Instruksi utama untuk AI agent
├── README.md                   # Dokumentasi ini
├── references/
│   └── common-fixes.md        # Katalog lengkap masalah umum & perbaikannya
└── examples/
    └── before-after.md         # Contoh sebelum & sesudah perbaikan
```

## Prinsip Keamanan

1. **Jangan ubah makna matematika** — hanya perbaiki formatting/typo
2. **Flag jika ragu** — gunakan `[REVIEW]` untuk item ambigu
3. **Transparansi** — selalu laporkan semua perubahan yang dilakukan
