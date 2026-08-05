# BlockNote Schema Reference

This document defines all valid block and inline content types for the exam system's BlockNote editor.

## Valid Block Types

These are the ONLY types allowed at the root of any `content` array:

| Type | Props | Content | Usage |
|------|-------|---------|-------|
| `paragraph` | `{}` | Inline content array | Standard text block |
| `heading` | `{"level": 1\|2\|3}` | Inline content array | Section headers |
| `bulletListItem` | `{}` | Inline content array | Unordered list items |
| `numberedListItem` | `{}` | Inline content array | Ordered list items |
| `equation` | `{"latex": "..."}` | `[]` (empty) | Standalone display math |
| `alert` | `{"type": "info"\|"warning"\|"success"\|"error"}` | Inline content array | Callout/highlight boxes |
| `chart` | `{"chartData": "<JSON string>"}` | `[]` (empty) | Interactive charts |
| `image` | `{"url": "...", "caption": "..."}` | `[]` (empty) | Images |
| `table` | `{}` | Table-specific content | Data tables |

## Valid Inline Content Types

These go INSIDE a block's `content` array:

| Type | Properties | Usage |
|------|-----------|-------|
| `text` | `{"text": "...", "styles": {}}` | Plain or styled text |
| `latex` | `{"props": {"latex": "...", "displayMode": false}}` | Inline math expression |

### Text Styles

The `styles` object on `text` nodes supports:
- `{"bold": true}` — Bold text
- `{"italic": true}` — Italic text
- `{"underline": true}` — Underlined text
- `{"code": true}` — Monospace/code
- `{}` — Normal (no styling)

## JSON Structures

### Paragraph with plain text
```json
{
  "type": "paragraph",
  "content": [
    {"type": "text", "text": "Diketahui sebuah segitiga...", "styles": {}}
  ]
}
```

### Paragraph with inline math
```json
{
  "type": "paragraph",
  "content": [
    {"type": "text", "text": "Jika ", "styles": {}},
    {"type": "latex", "props": {"latex": "x^2 + y^2 = r^2", "displayMode": false}},
    {"type": "text", "text": ", maka tentukan nilai r.", "styles": {}}
  ]
}
```

### Standalone equation block
```json
{
  "type": "equation",
  "props": {"latex": "\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"},
  "content": []
}
```

### Alert / Callout block
```json
{
  "type": "alert",
  "props": {"type": "success"},
  "content": [
    {"type": "text", "text": "Trik: Gunakan rumus cepat ABC!", "styles": {}}
  ]
}
```

### Chart block
```json
{
  "type": "chart",
  "props": {
    "chartData": "{\"chartType\":\"bar\",\"title\":\"Distribusi Nilai\",\"categories\":[\"A\",\"B\",\"C\"],\"series\":[{\"name\":\"Siswa\",\"values\":[15,25,10]}],\"options\":{\"showLegend\":true}}"
  },
  "content": []
}
```

## Database Enums

### Question `type`
- `"multiple_choice"` — Pilihan ganda (satu jawaban benar)
- `"multiple_select"` — Pilihan ganda (banyak jawaban benar)
- `"essay"` — Uraian/esai
- `"statement_reasoning"` — Pernyataan Benar/Salah

### Question `difficulty`
- `"easy"` — LOTS / Hafalan (C1-C2)
- `"medium"` — MOTS / Penerapan (C3)
- `"hard"` — HOTS / Analisis (C4-C6)

### Question `scoringStrategy`
- `"all_or_nothing"` — Benar semua atau salah (default)
- `"partial"` — Nilai parsial
- `"partial_with_penalty"` — Parsial dengan pengurangan

### Solution `solutionType`
- `"general"` — Cara biasa/konseptual
- `"fast_method"` — Cara cepat/trik
- `"tips"` — Kiat umum
- `"video_link"` — Link video pembahasan
