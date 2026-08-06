# Before & After Examples

Contoh konkret perbaikan teks input dari berbagai jenis masalah.

---

## Contoh 1: Encoding & Mojibake

### Before
```markdown
1. Tentukan nilai x yang memenuhi persamaan berikut â€" berikan jawabannya dalam bentuk pecahan:

$$ x² + 3x â€" 4 = 0 $$

(a) x = â€"4 atau x = 1
(b) x = 4 atau x = â€"1
(c) x = Â±2
(d) x = Â±4
```

### After
```markdown
1. Tentukan nilai x yang memenuhi persamaan berikut — berikan jawabannya dalam bentuk pecahan:

$$ x² + 3x — 4 = 0 $$

(a) x = –4 atau x = 1
(b) x = 4 atau x = –1
(c) x = ±2
(d) x = ±4
```

**Fixes:** `â€"` → `—`/`–`, `Â±` → `±`

---

## Contoh 2: OCR Artifacts

### Before
```markdown
1. Diketahui sebuah persegi panjang merniliki panjang l2 cm dna 1ebar 8 cm.
   Hitunglah 1uas dna ke1iling persegi panjang terse-
   but!

a) Luas = 96 crn², Ke1iling = 4O cm
b) Luas = 96 cm², Keliling = 40 cm
c) Luas = 86 cm², Keliling = 4O cm
d) Luas = 106 cm², Keliling = 4O cm
```

### After
```markdown
1. Diketahui sebuah persegi panjang memiliki panjang 12 cm dan lebar 8 cm.
   Hitunglah luas dan keliling persegi panjang tersebut!

(a) Luas = 96 cm², Keliling = 40 cm
(b) Luas = 96 cm², Keliling = 40 cm
(c) Luas = 86 cm², Keliling = 40 cm
(d) Luas = 106 cm², Keliling = 40 cm
```

**Fixes:**
- `merniliki` → `memiliki` (OCR: `rn` → `m`)
- `l2` → `12` (OCR: `l` → `1` in number context)
- `dna` → `dan` (typo)
- `1ebar` → `lebar` (OCR: `1` → `l` in word context)
- `1uas` → `luas` (OCR: `1` → `l`)
- `ke1iling` → `keliling` (OCR: `1` → `l`)
- `terse-\nbut` → `tersebut` (broken hyphenation)
- `crn` → `cm` (OCR: `rn` → `m`)
- `4O` → `40` (OCR: `O` → `0`)
- `a)` → `(a)` (option marker normalization)

---

## Contoh 3: Typo Bahasa Indonesia

### Before
```markdown
1. Berarkah hasil dri penjumlhan bilagan berikut?

   $ 125 + 375 = ... $

   Tentuakan jawabna yng benar!

a) 400
b) 500
c) 600
d) 450
```

### After
```markdown
1. Berapakah hasil dari penjumlahan bilangan berikut?

   $ 125 + 375 = ... $

   Tentukan jawaban yang benar!

(a) 400
(b) 500
(c) 600
(d) 450
```

**Fixes:** `Berarkah` → `Berapakah`, `dri` → `dari`, `penjumlhan` → `penjumlahan`, `bilagan` → `bilangan`, `Tentuakan` → `Tentukan`, `jawabna` → `jawaban`, `yng` → `yang`, option markers normalized.

---

## Contoh 4: LaTeX Fixes

### Before
```markdown
1. Jika $ f(x) = \frac x+1 x-2 $ dan $ g(x) = sqrtx $, tentukan nilai $ f(g(4) $

a) $ \frac{3{2} $
b) $\frac{3}{2}$
c) $ 3 $
d) $\frac{1}{2} $
```

### After
```markdown
1. Jika $ f(x) = \frac{x+1}{x-2} $ dan $ g(x) = \sqrt{x} $, tentukan nilai $ f(g(4)) $

(a) $ \frac{3}{2} $
(b) $ \frac{3}{2} $
(c) $ 3 $
(d) $ \frac{1}{2} $
```

**Fixes:**
- `\frac x+1 x-2` → `\frac{x+1}{x-2}` (missing braces)
- `sqrtx` → `\sqrt{x}` (missing backslash + braces)
- `f(g(4)` → `f(g(4))` (missing closing parenthesis)
- `\frac{3{2}` → `\frac{3}{2}` (missing `}` and `{`)
- Normalized LaTeX delimiter spacing

---

## Contoh 5: Mixed Issues (Real-world OCR scan)

### Before
```markdown
Ujian Akhir Serneser Ganjil 2024
Maternatika Kelas Xl
Ha1aman 2

3  Diketahui funsi $ f(x) = 2x â€" 3 $ dna $ g(x) = x² + l $.
   Tentuakan $(f \circ g)(x)$ !

A. $ 2x² â€" l $
B. $ 2x²â€"1 $
C  $ 2x² + 2x - 3 $
D. $2(x²+1)â€"3$

4. Jika logritma $ \log_{2} 8 = ... $, maka rnilai yng benar adalh ...

A) 2
B) 3
C) 4
D) 8
```

### After
```markdown
3. Diketahui fungsi $ f(x) = 2x – 3 $ dan $ g(x) = x² + 1 $.
   Tentukan $ (f \circ g)(x) $!

(a) $ 2x² – 1 $
(b) $ 2x² – 1 $
(c) $ 2x² + 2x - 3 $
(d) $ 2(x² + 1) – 3 $

4. Jika logaritma $ \log_{2} 8 = ... $, maka nilai yang benar adalah ...

(a) 2
(b) 3
(c) 4
(d) 8
```

**Fixes:**
- Removed stray header/page content (`Ujian Akhir...`, `Ha1aman 2`)
- `Serneser` → `Semester` (OCR: `rn` → `m`)
- `Maternatika` → `Matematika` (OCR: `rn` → `m`)
- `Xl` → `XI` (OCR)
- `Ha1aman` → `Halaman` (OCR: `1` → `l`)
- `3  ` → `3. ` (missing period)
- `funsi` → `fungsi` (typo)
- `â€"` → `–` (mojibake)
- `dna` → `dan` (typo)
- `Tentuakan` → `Tentukan` (typo)
- `l` → `1` (OCR in math context: `+ l` → `+ 1`)
- `â€"l` → `– 1` (combined mojibake + OCR)
- `logritma` → `logaritma` (typo)
- `rnilai` → `nilai` (OCR: `rn` → `n`)
- `yng` → `yang` (typo)
- `adalh` → `adalah` (typo)
- `A.` / `A)` / `C ` → `(a)` `(b)` `(c)` `(d)` (normalized option markers)
- Added proper spacing in LaTeX expressions
