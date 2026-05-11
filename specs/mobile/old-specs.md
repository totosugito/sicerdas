# Project Redesign Spec: Global Database Migration (Isar to Drift)

## 1. Project Overview
- **Project Name:** `bse` (Buku Sekolah Elektronik)
- **Current State:** Modular architecture with decentralized **Isar** databases per module.
- **Redesign Goal:** Consolidate all module data into a single, global **Drift (SQLite)** database to support relational queries, centralized migrations, and improved data integrity.

---

## 2. Proposed Global Database Schema (`AppDatabase`)

### **A. Book Module (Electronic Library)**
Hierarchical structure for managing school books.

| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| **BookParents** | `pId` | Int (PK) | Top-level (SD, SMP, SMA, etc.) |
| | `title` | Text | |
| **BookGroups** | `bgId` | Int (PK) | Categories (Grade 1 Math, etc.) |
| | `pId` | Int | FK to BookParents |
| | `title` | Text | |
| **Books** | `id` | Int (PK) | Unique Book ID |
| | `bgId` | Int | FK to BookGroups |
| | `title` | Text | |
| | `author` | Text | |
| | `sz` | Int | File size |
| | `pg` | Int | Page count |

### **B. Dictionary Module**
Vocabulary and user bookmarks.

| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Words** | `dictId` | Int (PK) | |
| | `word` | Text | |
| | `meaning` | Text | |
| | `mode` | Int | Dictionary type (e.g., EN-ID) |
| **Favorites** | `id` | Int (AI PK) | |
| | `dictId` | Int | References Words |

### **C. AI Bot Module**
Chat history for the assistant.

| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| **BotHistory** | `id` | Int (AI PK) | |
| | `text` | Text | Message content |
| | `isAi` | Bool | Sender type |
| | `datetime` | Int | Timestamp (Epoch) |

### **D. Periodic Table Module**
Scientific data for chemical elements.

| Table | Column | Type | Notes |
| :--- | :--- | :--- | :--- |
| **Atoms** | `atomicNumber` | Int (PK) | |
| | `symbol` | Text | |
| | `name` | Text | |
| | `properties` | Text (JSON) | Use Drift TypeConverter |
| **AtomNotes** | `rowId` | Int (PK) | |
| | `atomicNumber` | Int | FK to Atoms |
| | `locale` | Text | Language code (id, en, etc.) |

---

## 3. Technical Implementation Details

### **Dependencies**
Add these to the new project's `pubspec.yaml`:
```yaml
dependencies:
  drift: ^2.16.0
  sqlite3_flutter_libs: ^0.5.21
  path_provider: ^2.1.3
  path: ^1.9.0

dev_dependencies:
  drift_dev: ^2.16.0
  build_runner: ^2.4.0
```

### **Database Definition Example**
```dart
@DriftDatabase(tables: [
  Books, BookGroups, BookParents, 
  Words, Favorites, 
  BotHistory, 
  Atoms, AtomNotes
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
}
```

---

## 4. Key Improvements over Old Version
1. **Relational Constraints:** Use `REFERENCES` to ensure data integrity across modules.
2. **Type Converters:** Map complex JSON data (like atomic properties) directly to Dart objects.
3. **Unified Transactions:** Atomic operations across different feature sets.
4. **Reactive Streams:** Built-in support for auto-updating UI when database values change.
