# Project Redesign Spec: Global Database & Modular Architecture

## 1. Project Overview
- **Project Name:** `bse` (Buku Sekolah Elektronik)
- **Goal:** Redesign the app into a modern, modular, and offline-first library system.
- **Key Technologies:**
  - **Database:** Drift (SQLite) with FTS5 support.
  - **UI Framework:** Shadcn UI for Flutter.
  - **State Management:** Riverpod.
  - **Auth:** Email/Pass & Google OAuth2 (Fastify + Better Auth backend).
  - **PDF Viewer:** Syncfusion Flutter PDF Viewer.
  - **Charts:** Syncfusion Flutter Charts.

---

## 2. Database Schema (`AppDatabase`)

### **A. System & Auth**
| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Users** | `id` | Text (PK) | Local session storage |
| | `email` | Text | |
| | `name` | Text | |
| | `token` | Text | API Auth Token |
| **SyncMetadata** | `dataType` | Text (PK) | 'book', 'atom', etc. |
| | `dbVersion` | Int | Latest synced version |
| | `updatedAt` | DateTime | |

### **B. Book Module (Electronic Library)**
| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Books** | `id` | Text (PK) | UUID from API |
| | `bookId` | Int | Unique numerical ID |
| | `title` | Text | FTS5 Indexed |
| | `author` | Text | FTS5 Indexed |
| | `categoryId` | Int | FK to Categories |
| | `groupId` | Int | FK to Groups |
| | `gradeId` | Int | FK to Grades |
| | `size` | Int | |
| | `isDownloaded` | Bool | Offline status |
| | `localPath` | Text | Path to PDF file |
| | `coverXs/Lg` | Text | URLs |
| **Categories** | `id` | Int (PK) | |
| | `name` | Text | |

### **C. Periodic Table Module**
| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Atoms** | `atomicNumber` | Int (PK) | |
| | `atomicName` | Text | FTS5 Indexed |
| | `atomicSymbol` | Text | FTS5 Indexed |
| | `atomicProperties`| Text | JSON (TypeConverter) |
| | `atomicImages` | Text | JSON (TypeConverter) |
| | `atomicIsotope` | Text | JSON (TypeConverter) |
| | `atomicExtra` | Text | JSON (TypeConverter) |
| **AtomNotes** | `rowId` | Int (PK) | |
| | `atomicNumber` | Int | |
| | `locale` | Text | 'id', 'en', etc. |

---

## 3. UI/UX Design Implementation

### **A. Modular Home Dashboard**
The Home page is designed as a modular dashboard using **Shadcn UI** components:

1. **Header Section**:
   - **Greeting**: Personalized "Halo, [Nama]!" using data from the `Users` table.
   - **Global Search Bar**: A prominent `ShadInput` at the top that queries the FTS5 tables across all modules.
   - **Quick Actions**: Icons for Notifications, Dark Mode Toggle (`ShadSwitch`), and Profile/Login.

2. **Quick Access Grid (Modules)**:
   - A responsive grid of `ShadCard` elements representing the main app modules:
     - **Buku Digital**: Directs to the Library/Categories.
     - **Tabel Periodik**: Directs to the interactive chemical table.
     - **Kamus**: Directs to the offline dictionary.
     - **AI Assistant**: Directs to the Chat interface.
   - Each card uses consistent iconography and `ShadButton.outline` for navigation.

3. **Dynamic Content Sections**:
   - **"Buku Terbaru" (Latest Books)**: A horizontal scrolling list (`ListView.builder`) showing books marked `isNew: true`. Each item uses `ShadCard` with `CachedNetworkImage` and a `ShadBadge` for "NEW".
   - **"My Library" Shortcut**: A dedicated section or card that appears if `isDownloaded` books exist, providing quick access to offline reading.

### **B. Visual Consistency & Themes**
- **Root**: Wrapped in `ShadApp` for consistent styling.
- **Dark Mode**: Native support using `ShadTheme`. Colors and contrast are automatically adjusted for low-light environments.
- **Typography**: Clean, sans-serif fonts following Shadcn's design language.

---

## 4. Implementation Plan Details

### **A. Technical Infrastructure**
- **Folder Structure**:
  - `lib/api/`: Dio clients and endpoint-specific logic (auth, books).
  - `lib/data/`: Drift database definitions and DAOs.
  - `lib/data/repositories/`: Business logic for sync, auth, and downloads.
  - `lib/ui/`: Shadcn UI components and feature-specific screens.
  - `lib/l10n/`: Localization files (`.arb`).

### **B. Core Logic & Sync Strategy**
1. **Global Version Sync**: On launch, fetch `/versions` -> Update modules if `api.db_version > local.db_version`.
2. **Offline Book Management**: Use `Dio.download` to local storage -> Update `localPath` -> View via `SfPdfViewer.file`.
3. **Full-Text Search (FTS5)**: Dedicated virtual tables for lightning-fast offline queries.

---

## 5. Technical Implementation Details

### **Dependencies**
```yaml
dependencies:
  drift: ^2.16.0
  sqlite3_flutter_libs: ^0.5.21
  path_provider: ^2.1.3
  path: ^1.9.0
  dio: ^5.4.3
  google_sign_in: ^6.2.1
  flutter_riverpod: ^2.5.1
  shadcn_ui: ^0.1.0+2
  cached_network_image: ^3.3.1
  syncfusion_flutter_pdfviewer: ^25.1.37
  syncfusion_flutter_charts: ^25.1.37
  flutter_localizations:
    sdk: flutter
  intl: ^0.19.0

dev_dependencies:
  drift_dev: ^2.16.0
  build_runner: ^2.4.0
```

### **Localization**
Standard `l10n.yaml` with `.arb` files for English (`app_en.arb`) and Indonesian (`app_id.arb`).
