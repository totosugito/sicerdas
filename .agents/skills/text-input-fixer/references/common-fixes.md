# Common Fixes Reference

Comprehensive catalog of common raw input text issues and how to fix them.

## 1. Encoding & Mojibake

Table of the most frequent mojibake character corruptions (UTF-8 misread as Latin-1/Windows-1252):

| Mojibake | Correct Character | Description |
|----------|-------------------|-------------|
| `â€"` | `—` | Em dash |
| `â€"` | `–` | En dash |
| `â€™` | `'` | Right single quote |
| `â€˜` | `'` | Left single quote |
| `â€œ` | `"` | Left double quote |
| `â€` (+ `\x9D`) | `"` | Right double quote |
| `Â°` | `°` | Degree sign |
| `Â²` | `²` | Superscript 2 |
| `Â³` | `³` | Superscript 3 |
| `Ã—` | `×` | Multiplication sign |
| `Ã·` | `÷` | Division sign |
| `â‰¤` | `≤` | Less than or equal |
| `â‰¥` | `≥` | Greater than or equal |
| `â‰ ` | `≠` | Not equal |
| `Ï€` | `π` | Pi |
| `Î±` | `α` | Alpha |
| `Î²` | `β` | Beta |
| `Î³` | `γ` | Gamma |
| `Î¸` | `θ` | Theta |
| `Î»` | `λ` | Lambda |
| `Î¼` | `μ` | Mu |
| `Ïƒ` | `σ` | Sigma |
| `â†'` | `→` | Right arrow |
| `â†'` | `⇒` | Double right arrow |
| `âˆ√` | `√` | Square root |
| `âˆž` | `∞` | Infinity |
| `Â±` | `±` | Plus-minus |

### HTML Entities

| Entity | Correct Character |
|--------|-------------------|
| `&amp;` | `&` |
| `&lt;` | `<` |
| `&gt;` | `>` |
| `&nbsp;` | ` ` (regular space) |
| `&#8211;` | `–` |
| `&#8212;` | `—` |
| `&#8216;` | `'` |
| `&#8217;` | `'` |
| `&#8220;` | `"` |
| `&#8221;` | `"` |

### Invisible Characters (Remove Completely)

| Character | Unicode | Description |
|-----------|---------|-------------|
| (BOM) | `U+FEFF` | Byte Order Mark |
| (ZWSP) | `U+200B` | Zero Width Space |
| (ZWNJ) | `U+200C` | Zero Width Non-Joiner |
| (ZWJ) | `U+200D` | Zero Width Joiner |
| (SHY) | `U+00AD` | Soft Hyphen |
| (LRM) | `U+200E` | Left-to-Right Mark |
| (RLM) | `U+200F` | Right-to-Left Mark |

---

## 2. OCR Artifacts

### Confusable Lookalike Characters (Context-dependent — use caution!)

| Misread OCR | Correct | Context Example |
|-------------|---------|-----------------|
| `l` | `1` | In numbers: `l23` → `123` |
| `1` | `l` | In words: `1ogaritma` → `logaritma` |
| `O` | `0` | In numbers: `1O0` → `100` |
| `0` | `O` | In words: `0leh` → `Oleh` |
| `rn` | `m` | In words: `pernainan` → `permainan` |
| `cl` | `d` | In words: `clengan` → `dengan` |
| `vv` | `w` | In words: `javvaban` → `jawaban` |
| `ii` | `n` | Certain word contexts |
| `I` | `l` | In words: `Iogika` → `logika` |
| `S` | `5` | In numbers |
| `B` | `8` | In numbers |

### Line Break Artifacts

```
INCORRECT: persa-
           maan linear
CORRECT:   persamaan linear

INCORRECT: dike-
           tahui
CORRECT:   diketahui
```

---

## 3. Bahasa Indonesia Typo & EYD Fixes

### Common Words

| Incorrect | Correct |
|-----------|---------|
| `menenukan` | `menentukan` |
| `persamaaan` | `persamaan` |
| `penguragan` | `pengurangan` |
| `penjumlhan` | `penjumlahan` |
| `perklian` | `perkalian` |
| `pembgian` | `pembagian` |
| `bilagan` | `bilangan` |
| `detemukan` | `ditemukan` |
| `penyelesain` | `penyelesaian` |
| `menghitug` | `menghitung` |
| `berarkah` | `berapakah` |
| `tentuakan` | `tentukan` |
| `diketahiu` | `diketahui` |
| `ditanayakan` | `ditanyakan` |
| `jawabna` | `jawaban` |
| `pilihlha` | `pilihlah` |
| `berdasakan` | `berdasarkan` |
| `merupkan` | `merupakan` |
| `adalh` | `adalah` |
| `denan` | `dengan` |
| `dri` | `dari` |
| `untk` | `untuk` |
| `pda` | `pada` |
| `atua` | `atau` |
| `dna` | `dan` |
| `yng` | `yang` |
| `adlah` | `adalah` |
| `apabiila` | `apabila` |
| `sedangakn` | `sedangkan` |
| `sebgai` | `sebagai` |
| `sehigga` | `sehingga` |
| `terutma` | `terutama` |
| `kemudain` | `kemudian` |
| `manakla` | `manakala` |

### Mathematics Terms

| Incorrect | Correct |
|-----------|---------|
| `logritma` | `logaritma` |
| `trigonmetri` | `trigonometri` |
| `ekspoensial` | `eksponensial` |
| `polinominal` | `polinomial` |
| `integral` | `integral` |
| `diferensial` | `diferensial` |
| `matrik` | `matriks` |
| `statisitk` | `statistik` |
| `probablitas` | `probabilitas` |
| `geometery` | `geometri` |
| `aritmatka` | `aritmatika` |
| `aljbar` | `aljabar` |
| `koefsien` | `koefisien` |
| `variabe` | `variabel` |
| `konstata` | `konstanta` |
| `funsi` | `fungsi` |
| `himpunna` | `himpunan` |
| `relai` | `relasi` |
| `deret` | `deret` |
| `barsan` | `barisan` |
| `asimtot` | `asimtot` |
| `interval` | `interval` |
| `domain` | `domain` |
| `kodomain` | `kodomain` |
| `gradein` | `gradien` |
| `koordinta` | `koordinat` |

### Physics Terms

| Incorrect | Correct |
|-----------|---------|
| `keceptan` | `kecepatan` |
| `percepatn` | `percepatan` |
| `gravitsi` | `gravitasi` |
| `energi kintik` | `energi kinetik` |
| `energi poensial` | `energi potensial` |
| `thermodnmika` | `termodinamika` |
| `elektormgnet` | `elektromagnet` |
| `gelombnag` | `gelombang` |
| `frekuensi` | `frekuensi` |
| `amplitdo` | `amplitudo` |
| `hamabtan` | `hambatan` |
| `tegangn` | `tegangan` |
| `kapastor` | `kapasitor` |
| `induktnsi` | `induktansi` |
| `momentm` | `momentum` |
| `impls` | `impuls` |

### Chemistry Terms

| Incorrect | Correct |
|-----------|---------|
| `stoikiomteri` | `stoikiometri` |
| `termokima` | `termokimia` |
| `elektrlisis` | `elektrolisis` |
| `kesetimbagan` | `kesetimbangan` |
| `oksidsi` | `oksidasi` |
| `redukis` | `reduksi` |
| `lartan` | `larutan` |
| `konsentasi` | `konsentrasi` |
| `molaltas` | `molalitas` |
| `molartas` | `molaritas` |

### Capitalization

- Always capitalize the start of a sentence.
- Proper nouns: `einstein` → `Einstein`, `newton` → `Newton`, `pythagoras` → `Pythagoras`.
- SI Units: `kg`, `m`, `s`, `N`, `J`, `W`, `Pa`, `Hz` (case-sensitive — do not change).
- Acronyms: `SMA`, `SMK`, `EYD`, `SBMPTN`, `UTBK`.

### Punctuation Spacing

```
INCORRECT: word .         → CORRECT: word.
INCORRECT: word,word      → CORRECT: word, word
INCORRECT: word ;word     → CORRECT: word; word
INCORRECT: word :         → CORRECT: word:
INCORRECT: ( x + 1 )     → CORRECT: (x + 1)   (in regular text, outside LaTeX)
INCORRECT: word...        → CORRECT: word...    (3 dots OK)
INCORRECT: word....       → CORRECT: word...    (more than 3 -> 3)
INCORRECT: word,,         → CORRECT: word,
```

---

## 4. LaTeX Fixes

### Delimiter Normalization

```
INCORRECT: \( x^2 + 1 \)      → CORRECT: $ x^2 + 1 $
INCORRECT: \[ x^2 + 1 \]      → CORRECT: $$ x^2 + 1 $$
INCORRECT: $ x^2 + 1$         → CORRECT: $ x^2 + 1 $     (normalize spacing)
INCORRECT: $x^2 + 1 $         → CORRECT: $ x^2 + 1 $     (normalize spacing)
```

### Common LaTeX Typos

| Incorrect | Correct | Notes |
|-----------|---------|-------|
| `\frac x y` | `\frac{x}{y}` | Needs curly braces |
| `\sqr{x}` | `\sqrt{x}` | Incorrect command |
| `\tmes` | `\times` | Typo |
| `\tiems` | `\times` | Typo |
| `\aplha` | `\alpha` | Typo |
| `\bta` | `\beta` | Typo |
| `\gmma` | `\gamma` | Typo |
| `\thta` | `\theta` | Typo |
| `\lmabda` | `\lambda` | Typo |
| `\sgima` | `\sigma` | Typo |
| `\deta` | `\delta` | Typo |
| `\epslon` | `\epsilon` | Typo |
| `\inft` | `\infty` | Typo |
| `\righarrow` | `\rightarrow` | Typo |
| `\Righarrow` | `\Rightarrow` | Typo |
| `\leftrrow` | `\leftarrow` | Typo |
| `\oversert` | `\overset` | Typo |
| `\underset` | `\underset` | OK |
| `sqrt` | `\sqrt` | Missing backslash |
| `frac` | `\frac` | Missing backslash |
| `times` | `\times` | Missing backslash |
| `sin` (in math) | `\sin` | Missing backslash |
| `cos` (in math) | `\cos` | Missing backslash |
| `tan` (in math) | `\tan` | Missing backslash |
| `log` (in math) | `\log` | Missing backslash |
| `ln` (in math) | `\ln` | Missing backslash |
| `lim` (in math) | `\lim` | Missing backslash |
| `sum` (in math) | `\sum` | Missing backslash |
| `int` (in math) | `\int` | Missing backslash (integration) |

### Curly Brace Mismatches

Count `{` and `}` in each LaTeX expression. If unbalanced:
- If obvious which brace is missing → fix automatically
- If ambiguous → flag as `[BROKEN_LATEX: ...]`

---

## 5. Markdown Structure

### Option Markers

```
INCORRECT: a) option    → CORRECT: (a) option
INCORRECT: a. option    → CORRECT: (a) option
INCORRECT: A) option    → CORRECT: (a) option
INCORRECT: A. option    → CORRECT: (a) option
INCORRECT: (A) option   → CORRECT: (a) option
```

### Spacing

```
INCORRECT:
1. Question one?
(a) option 1
(b) option 2
2. Question two?

CORRECT:
1. Question one?

(a) option 1
(b) option 2

2. Question two?
```

### Stray Content (Remove)

- Page numbers: `- 1 -`, `Page 2`, `Halaman 3`
- Repeating headers/footers: `UAS Matematika Semester 1`
- Watermark text: `DRAFT`, `CONFIDENTIAL`
- Empty bullet points or list items
