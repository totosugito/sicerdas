# Common Fixes Reference

Katalog lengkap masalah umum pada teks input dan cara memperbaikinya.

## 1. Encoding & Mojibake

Tabel karakter mojibake yang paling sering muncul (UTF-8 salah dibaca sebagai Latin-1/Windows-1252):

| Mojibake | Karakter Benar | Deskripsi |
|----------|---------------|-----------|
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
| `âˆš` | `√` | Square root |
| `âˆž` | `∞` | Infinity |
| `Â±` | `±` | Plus-minus |

### HTML Entities

| Entity | Karakter |
|--------|----------|
| `&amp;` | `&` |
| `&lt;` | `<` |
| `&gt;` | `>` |
| `&nbsp;` | ` ` (spasi biasa) |
| `&#8211;` | `–` |
| `&#8212;` | `—` |
| `&#8216;` | `'` |
| `&#8217;` | `'` |
| `&#8220;` | `"` |
| `&#8221;` | `"` |

### Invisible Characters (Hapus Sepenuhnya)

| Karakter | Unicode | Deskripsi |
|----------|---------|-----------|
| (BOM) | `U+FEFF` | Byte Order Mark |
| (ZWSP) | `U+200B` | Zero Width Space |
| (ZWNJ) | `U+200C` | Zero Width Non-Joiner |
| (ZWJ) | `U+200D` | Zero Width Joiner |
| (SHY) | `U+00AD` | Soft Hyphen |
| (LRM) | `U+200E` | Left-to-Right Mark |
| (RLM) | `U+200F` | Right-to-Left Mark |

---

## 2. OCR Artifacts

### Karakter Mirip (Context-dependent — hati-hati!)

| OCR Salah | Benar | Konteks |
|-----------|-------|---------|
| `l` | `1` | Dalam angka: `l23` → `123` |
| `1` | `l` | Dalam kata: `1ogaritma` → `logaritma` |
| `O` | `0` | Dalam angka: `1O0` → `100` |
| `0` | `O` | Dalam kata: `0leh` → `Oleh` |
| `rn` | `m` | Dalam kata: `pernainan` → `permainan` |
| `cl` | `d` | Dalam kata: `clengan` → `dengan` |
| `vv` | `w` | Dalam kata: `javvaban` → `jawaban` |
| `ii` | `n` | Konteks tertentu |
| `I` | `l` | Dalam kata: `Iogika` → `logika` |
| `S` | `5` | Dalam angka |
| `B` | `8` | Dalam angka |

### Line Break Artifacts

```
SALAH: persa-
       maan linear
BENAR: persamaan linear

SALAH: dike-
       tahui
BENAR: diketahui
```

---

## 3. Typo Bahasa Indonesia (EYD)

### Kata Umum

| Salah | Benar |
|-------|-------|
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
| `maka` | `maka` |
| `apabiila` | `apabila` |
| `sedangakn` | `sedangkan` |
| `sebgai` | `sebagai` |
| `sehigga` | `sehingga` |
| `terutma` | `terutama` |
| `kemudain` | `kemudian` |
| `manakla` | `manakala` |

### Istilah Matematika

| Salah | Benar |
|-------|-------|
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

### Istilah Fisika

| Salah | Benar |
|-------|-------|
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

### Istilah Kimia

| Salah | Benar |
|-------|-------|
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

### Kapitalisasi

- Awal kalimat selalu kapital
- Proper nouns: `einstein` → `Einstein`, `newton` → `Newton`, `pythagoras` → `Pythagoras`
- Satuan SI: `kg`, `m`, `s`, `N`, `J`, `W`, `Pa`, `Hz` (case-sensitive — jangan ubah)
- Akronim: `SMA`, `SMK`, `EYD`, `SBMPTN`, `UTBK`

### Tanda Baca

```
SALAH: kata .         → BENAR: kata.
SALAH: kata,kata      → BENAR: kata, kata
SALAH: kata ;kata     → BENAR: kata; kata  (atau "kata, kata" tergantung konteks)
SALAH: kata :         → BENAR: kata:
SALAH: ( x + 1 )     → BENAR: (x + 1)   (khusus di teks, bukan LaTeX)
SALAH: kata...        → BENAR: kata...    (tiga titik OK)
SALAH: kata....       → BENAR: kata...    (lebih dari tiga → tiga)
SALAH: kata,,         → BENAR: kata,
```

---

## 4. LaTeX Fixes

### Delimiter Normalization

```
SALAH: \( x^2 + 1 \)      → BENAR: $ x^2 + 1 $
SALAH: \[ x^2 + 1 \]      → BENAR: $$ x^2 + 1 $$
SALAH: $ x^2 + 1$         → BENAR: $ x^2 + 1 $     (normalize spacing)
SALAH: $x^2 + 1 $         → BENAR: $ x^2 + 1 $     (normalize spacing)
```

### Common LaTeX Typos

| Salah | Benar | Catatan |
|-------|-------|---------|
| `\frac x y` | `\frac{x}{y}` | Butuh kurung kurawal |
| `\sqr{x}` | `\sqrt{x}` | Perintah salah |
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
| `int` (in math) | `\int` | Missing backslash (integration, bukan "integer") |

### Curly Brace Mismatches

Hitung jumlah `{` dan `}` di setiap ekspresi LaTeX. Jika tidak sama:
- Jika jelas mana yang hilang → perbaiki otomatis
- Jika ambigu → tandai sebagai `[BROKEN_LATEX: ...]`

---

## 5. Markdown Structure

### Option Markers

```
SALAH: a) jawaban    → BENAR: (a) jawaban
SALAH: a. jawaban    → BENAR: (a) jawaban
SALAH: A) jawaban    → BENAR: (a) jawaban
SALAH: A. jawaban    → BENAR: (a) jawaban
SALAH: (A) jawaban   → BENAR: (a) jawaban
```

### Spacing

```
SALAH:
1. Soal pertama?
(a) opsi 1
(b) opsi 2
2. Soal kedua?

BENAR:
1. Soal pertama?

(a) opsi 1
(b) opsi 2

2. Soal kedua?
```

### Stray Content (Hapus)

- Nomor halaman: `- 1 -`, `Page 2`, `Halaman 3`
- Header/footer berulang: `UAS Matematika Semester 1`
- Watermark teks: `DRAFT`, `CONFIDENTIAL`
- Empty bullet points atau list items
