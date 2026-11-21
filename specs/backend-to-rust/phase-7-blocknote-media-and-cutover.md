# Phase 7: BlockNote Media Upload, Storage Cleanup & Production Cutover

**Goal:** Implement full BlockNote `multipart/form-data` (`FormData`) file upload, external image ingestion, and storage cleanup across all 10 BlockNote create/update endpoints and 3 remaining delete services in `backend-rust`, verify on both local & Cloudflare R2 (S3) storage, and complete production cutover.

---

## 1. Shared BlockNote Media Helper (`backend-rust/src/platform/blocknote.rs`)
Mirror `backend/src/utils/blocknote/blocknote-utils.ts`:
- [ ] **7.1.1** `strip_blocknote_urls(content, base_url, s3_public_url)` — strip `baseUrl/uploads/` or `s3_public_url/uploads/` prefixes back to relative paths before DB storage.
- [ ] **7.1.2** `process_blocknote_files(storage, sub_dir, entity_id, files, created_at, max_width=1024, quality=80)` — resize/compress images with `image` crate and upload via `StorageClient::save_file` to `{subDir}/{YYYY-MM}/{entityId}/{unique_filename}`.
- [ ] **7.1.3** `process_external_images(http, storage, sub_dir, entity_id, content, created_at, base_url)` — download external `http(s)://` image URLs in BlockNote blocks and store them in `StorageClient`.
- [ ] **7.1.4** `replace_blocknote_urls(content, url_map)` — replace `blob:` / original filename references in BlockNote `image`/`file`/`audio`/`video` blocks with saved relative paths.
- [ ] **7.1.5** `cleanup_blocknote_files(storage, old_content, new_content)` — diff old vs new BlockNote URLs and delete removed files via `StorageClient::delete_file`.

---

## 2. Dual `Json | Multipart` Support on 10 BlockNote Endpoints
Support both `application/json` and `multipart/form-data` (`FormData` from `frontend/src/api/`) on:
- [ ] **7.2.1** `exam/questions`: `POST /api/exam/questions/admin/create` & `PUT /api/exam/questions/admin/update/{id}` (`subDir = "question"` — processes `content` + `reasonContent`)
- [ ] **7.2.2** `exam/question_options`: `POST /api/exam/question-options/admin/create` & `PUT /api/exam/question-options/admin/update/{id}` (`subDir = "question"` — processes `content`)
- [ ] **7.2.3** `exam/question_solutions`: `POST /api/exam/question-solutions/admin/create` & `PUT /api/exam/question-solutions/admin/update/{id}` (`subDir = "question"` — processes `content`)
- [ ] **7.2.4** `exam/passages`: `POST /api/exam/passages/admin/create` & `PUT /api/exam/passages/admin/update/{id}` (`subDir = "passage"` — processes `content`)
- [ ] **7.2.5** `course/lecture_texts`: `POST /api/course/lecture-texts/admin/create` & `PUT /api/course/lecture-texts/admin/update/{id}` (`subDir = "lecture-text"` — processes `content`)

---

## 3. Storage Cleanup on Delete (3 Remaining Services)
- [ ] **7.3.1** `exam/question_options/services/delete.rs`: call `cleanup_blocknote_files` for deleted option's `content`.
- [ ] **7.3.2** `exam/question_solutions/services/delete.rs`: call `cleanup_blocknote_files` for deleted solution's `content`.
- [ ] **7.3.3** `course/lecture_texts/services/delete_lecture_text.rs`: call `state.storage.delete_storage_directory("lecture-text", ...)` when deleting a lecture text.
*(Already done in Phase 3/4: `questions/delete.rs`, `passages/delete.rs`, `courses/delete_course.rs`, `users/delete_user.rs`.)*

---

## 4. Verification (Local + S3/R2 + Chrome UI)
- [ ] **7.4.1** `cd backend-rust && cargo check --all-targets && cargo test` (**0 warnings**).
- [ ] **7.4.2** Test `FormData` BlockNote image upload on Question, Option, Solution, Passage, and Lecture Text (`create` → `update` image replacement → `delete` cleanup) against **both** local `/uploads/` (`USE_S3_STORAGE=false`) and Cloudflare R2 (`USE_S3_STORAGE=true`).
- [ ] **7.4.3** Test in Chrome UI (`/exam/admin/...`, `/lecture-texts/admin/...`) with `0` console/page errors.

---

## 5. Production Cutover Checklist
- [ ] **7.5.1** Backup production PostgreSQL (`pg_dump`) and `/var/www/sicerdas.com/frontend` (`frontend.bak.<date>`).
- [ ] **7.5.2** Apply [0001_high_volume_job_indexes.sql](./migrations/0001_high_volume_job_indexes.sql) (and any pending schema sync) on production DB.
- [ ] **7.5.3** Upload `sicerdas-backend` release binary to `/var/www/sicerdas.com/backend-rust/` and create `/var/www/sicerdas.com/backend-rust/.env` (adding `RESEND_API_KEY`, `NO_REPLY_EMAIL`, `NO_REPLY_EMAIL_NAME`).
- [ ] **7.5.4** Build `frontend` with `VITE_APP_BASE_URL=https://api.sicerdas.com` and upload `dist/*` to `/var/www/sicerdas.com/frontend/`.
- [ ] **7.5.5** Disable legacy Node `sicerdas.service`, start `backend-rust` on `:5550`, configure daily cron (`sicerdas-backend job daily-all`), and verify live health + logs.
