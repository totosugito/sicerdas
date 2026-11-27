# Sicerdas Viewer (`herdr-plugin`)

Viewer untuk file soal Sicerdas (`.md` dengan frontmatter/variabel, `.json` format BlockNote/exam question, dan gambar) yang dapat berjalan sebagai **TUI plugin** di `herdr` maupun bersama **GUI mod** di `herdr-app`.

## Arsitektur Singkat

1. **Mode TUI (`herdr-plugin/src/`)**
   - Dijalankan langsung oleh `herdr` menggunakan `bun` (tanpa proses compile/build).
   - Merender ekspresi LaTeX menjadi karakter Unicode + warna ANSI ([`src/mathUnicode.ts`](src/mathUnicode.ts)) agar cepat dan ringan di terminal.
   - Mendukung preview gambar di terminal via `chafa` atau `viu` ([`src/renderImage.ts`](src/renderImage.ts)).

2. **Mode GUI (`herdr-app` Mods)**
   - Mod di `~/.config/herdr-app/mods/sicerdas-viewer/` menggunakan [`renderMathSvg.ts`](src/renderMathSvg.ts) (`mathjax-full`) untuk mengonversi LaTeX menjadi file **SVG** yang di-cache di `~/.config/herdr-app/data/sicerdas-viewer/math/` lalu ditampilkan di `gpui-kit`.
   - Terintegrasi dengan `~/.config/herdr-app/mods/sicerdas-files/` (pembuka tab) dan kategori **Sicerdas** di `~/.config/herdr-app/mods/zed-settings/` untuk toggle Enable/Disable.

---

## Prasyarat di PC Baru

- [Bun](https://bun.sh/) (`bun` tersedia di `PATH`)
- `herdr` dan/atau `herdr-app`
- _(Opsional, untuk preview gambar di TUI)_ `chafa` atau `viu`:
  ```bash
  sudo apt install chafa
  ```

---

## Langkah Setup Saat Pindah PC

### 1. Setup `herdr-plugin` (TUI)

1. Masuk ke folder `herdr-plugin` dan instal dependensi:
   ```bash
   cd /path/ke/sicerdas/herdr-plugin
   bun install
   ```
2. Perbarui path absolut di [`herdr-plugin.toml`](herdr-plugin.toml) sesuai lokasi repo di PC baru:
   ```toml
   command = ["bun", "run", "/path/ke/sicerdas/herdr-plugin/src/index.ts"]
   ```
3. Pastikan konfigurasi `herdr` (`~/.config/herdr/plugins.json` atau `~/.config/herdr/config.toml`) mengarah ke path `herdr-plugin.toml` / `src/index.ts` yang baru.
4. Uji jalankan manual lewat terminal:
   ```bash
   bun run src/index.ts /path/ke/folder-soal
   ```

> **Catatan:** Karena `herdr` menjalankan `src/index.ts` langsung dengan `bun run`, tidak ada langkah compile/build ulang setiap kali kode diubah.

### 2. Setup GUI Mod di `herdr-app` _(jika menggunakan `herdr-app`)_

Jika ingin memindahkan tampilan GUI beserta setting Enable/Disable ke PC baru:

1. Salin folder mod berikut dari PC lama ke `~/.config/herdr-app/mods/` di PC baru:
   - `sicerdas-viewer/`
   - `sicerdas-files/`
   - `zed-settings/`
2. Masuk ke `~/.config/herdr-app/mods/sicerdas-viewer/` dan instal dependensi `mathjax-full` untuk `renderMathSvg.ts`:
   ```bash
   cd ~/.config/herdr-app/mods/sicerdas-viewer
   bun install
   ```
3. Jika folder default soal berbeda di PC baru, sesuaikan `DEFAULT_DIR` di `~/.config/herdr-app/mods/sicerdas-viewer/main.js`.
4. Restart `herdr-app`.

---

## Pengaturan di `herdr-app`

Buka **Settings** di `herdr-app`, lalu pilih kategori **Sicerdas**:

- **Enable Sicerdas preview** (`sicerdas.options.enabled`):
  - **ON**: File `.md`, `.json`, dan gambar dibuka dengan `sicerdas-viewer`.
  - **OFF**: Semua file dibuka langsung dengan editor teks (`zed-file`).
- **Exam files only (smart detect)** (`sicerdas.options.smartDetect`):
  - **ON**: File proyek/konfigurasi umum (`package.json`, `tsconfig.json`, `README.md`, `AGENTS.md`, `node_modules/`, `.git/`, dll.) otomatis dilewati dan dibuka di editor teks (`zed-file`).

---

## Shortcut TUI (`sicerdas-viewer`)

| Tombol               | Fungsi                                  |
| -------------------- | --------------------------------------- |
| `↑` / `↓`, `j` / `k` | Navigasi explorer / scroll viewer       |
| `Enter`              | Buka file / expand-collapse folder      |
| `Tab`                | Pindah fokus Explorer ↔ Viewer          |
| `v` / `1-9` / `0`    | Ganti Variable Set / Template `{{var}}` |
| `r`                  | Toggle tampilan Formatted ↔ Raw         |
| `e`                  | Toggle panel Explorer                   |
| `Backspace`          | Naik ke parent folder                   |
| `q`                  | Keluar                                  |

---

## Struktur Direktori

```text
herdr-plugin/
├── herdr-plugin.toml          # Manifest plugin untuk herdr
├── package.json               # Dependensi (js-yaml, mathjax-full, mathjs)
├── tsconfig.json
└── src/
    ├── index.ts               # Entry point TUI
    ├── tui.ts                 # Layout, navigasi, dan keybindings TUI
    ├── renderMarkdown.ts      # Renderer file .md + frontmatter variabel
    ├── renderJsonQuestion.ts  # Renderer soal .json (BlockNote/exam)
    ├── mathUnicode.ts         # Konverter LaTeX -> Unicode + ANSI
    ├── renderImage.ts         # Preview gambar TUI via chafa/viu
    ├── renderMathSvg.ts       # Renderer LaTeX -> SVG (dipakai oleh mod herdr-app)
    ├── variableUtils.ts       # Parser frontmatter & evaluator formula variabel
    ├── fsTree.ts              # Tree explorer direktori
    └── ansi.ts                # Helper warna ANSI & word-wrapping
```
