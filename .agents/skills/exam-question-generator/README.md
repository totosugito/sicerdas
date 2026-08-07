# 📝 Exam Question Generator Skill

Skill untuk mengonversi file markdown berisi soal ujian mentah menjadi format JSON BlockNote yang valid untuk sistem ujian sicerdas.

## Cara Penggunaan

### 1. Siapkan File Markdown Soal

Buat file `.md` berisi soal dengan format seperti berikut:

```markdown
1. Diketahui $ f(x) = 2020^{g(x)} $, $ g(x) = 2x $, $ \tan x = 2^{-1} $ maka nilai dari $ \log_{2020} f(x) $ ...

(a) -1
(b) 0
(c) 1
(d) 2
(e) 4
```

**Aturan penulisan:**
- Nomor soal boleh ada (akan otomatis dihapus oleh skill)
- Gunakan `$ ... $` untuk LaTeX inline dan `$$ ... $$` untuk display math
- Opsi jawaban ditulis dengan `(a)`, `(b)`, `(c)`, dst.
- Boleh berisi banyak soal sekaligus dalam satu file
- Soal esai cukup tulis tanpa opsi jawaban

### 2. Trigger Skill di Chat

Ketik salah satu perintah berikut di chat, disertai referensi ke file markdown:

```
Generate exam questions from @[path/to/soal.md]
```

```
Convert soal dari @[test/question.md] ke JSON
```

```
Parse question markdown @[soal-fisika.md]
```

**Kata kunci trigger:** `generate exam`, `parse question`, `convert soal`, `create questions.json`, `extract soal from markdown`

### 3. Output

Skill akan menghasilkan file `questions-output.json` (atau nama lain sesuai permintaan) yang berisi:

- ✅ JSON array valid — siap diimpor ke sistem ujian
- ✅ Format BlockNote yang benar (`equation`, `latex`, `paragraph`, `alert`)
- ✅ Solusi lengkap dan berurutan (Diketahui → Ditanya → Pembahasan)
- ✅ Teks dalam Bahasa Indonesia baku (EYD)
- ✅ Tags kategorisasi otomatis

## Format Soal yang Didukung

| Tipe Soal | Cara Penulisan di Markdown |
|-----------|---------------------------|
| **Pilihan Ganda** | Tulis soal + opsi `(a)` `(b)` `(c)` `(d)` `(e)` |
| **Pilihan Banyak** | Sama seperti pilihan ganda, tambahkan catatan "pilih lebih dari satu" |
| **Esai** | Tulis soal tanpa opsi jawaban |
| **Pernyataan-Sebab** | Gunakan format `Pernyataan SEBAB Alasan` |

## Struktur Skill

```
exam-question-generator/
├── SKILL.md                    # Instruksi utama untuk AI agent
├── README.md                   # Dokumentasi ini
├── references/
│   ├── blocknote-schema.md     # Referensi semua tipe block/inline yang valid
│   └── quality-rules.md       # Aturan kualitas, scoring, dan format
└── examples/
    ├── input-sample.md         # Contoh input markdown
    └── output-sample.json      # Contoh output JSON yang dihasilkan
```

## Contoh Input → Output

**Input** (`input-sample.md`):
```markdown
1. Berapakah hasil dari $ 3x + 7 $ jika $ x = 5 $?

(a) 12
(b) 15
(c) 22
(d) 35
```

**Output** (`output-sample.json`) — ringkasan:
```json
{
  "type": "multiple_choice",
  "difficulty": "easy",
  "content": [
    {
      "type": "paragraph",
      "content": [
        {"type": "text", "text": "Berapakah hasil dari ", "styles": {}},
        {"type": "latex", "props": {"latex": "3x + 7", "displayMode": false}},
        {"type": "text", "text": " jika ", "styles": {}},
        {"type": "latex", "props": {"latex": "x = 5", "displayMode": false}},
        {"type": "text", "text": "?", "styles": {}}
      ]
    }
  ],
  "options": ["paragraph blocks berisi inline latex/text untuk setiap opsi"],
  "solutions": ["Diketahui → Ditanya → Pembahasan lengkap"],
  "tags": ["Matematika", "Aljabar"]
}
```

## Tips

- **Soal hitungan:** Skill akan otomatis membuat `variableFormulas` dengan 3–5 set angka berbeda
- **Soal teori:** `variableFormulas` akan di-set `null`
- **Banyak soal:** Taruh semua soal dalam satu file, pisahkan dengan nomor (`1.`, `2.`, dst.)
- **Jangan khawatir formatting:** Skill akan otomatis memisahkan teks dan ekspresi matematika ke tipe yang benar (`text` vs `latex` vs `equation`)
