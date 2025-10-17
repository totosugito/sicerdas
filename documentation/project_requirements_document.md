# Project Requirements Document for "sicerdas"

## 1. Project Overview
The "sicerdas" application is a full-stack web platform designed to manage and deliver educational content—primarily books—to learners, teachers, and administrators. It provides a structured library where content providers can create, update, and organize learning materials into categories and groups. On the consumer side, users can browse, search, filter, and interact with content, while administrators oversee the platform via an admin panel. An AI-powered chat feature enhances the learning experience by offering real-time assistance and contextual guidance on study materials.

This platform is being built to streamline the creation, distribution, and moderation of digital learning resources in one cohesive system. Key objectives include:  
• Establishing a robust Content Management System (CMS) with full CRUD (Create, Read, Update, Delete) capabilities for books and related materials.  
• Ensuring secure, role-based user authentication and profile management for administrators, teachers, and students.  
• Tracking user engagement metrics (views, downloads, likes) for analytics and reporting.  
• Delivering an integrated AI chat assistant for immediate, interactive learner support.  
• Supporting multiple languages through internationalization (i18next) and offering a responsive, accessible UI.

**Success Criteria:**  
1. Administrators can manage content and user reports via the admin panel without errors.  
2. End users can search, view, and interact with educational materials with sub-1.5s page-load times.  
3. AI chat feature responds to user queries within 1–2 seconds and accurately references available content.  
4. The system securely handles 10,000+ concurrent users, with data integrity and GDPR compliance.

---

## 2. In-Scope vs. Out-of-Scope

**In-Scope (MVP):**  
- Content Management: Admins/Teachers can create, read, update, delete books; organize by category or group; add metadata (author, description, tags).  
- User Management & Authentication: Sign-up, sign-in, password reset, email verification; role-based access control (Admin, Teacher, Student).  
- User Interaction Tracking: Record views, downloads, likes; basic analytics dashboard.  
- Reporting & Moderation: Users can flag inappropriate content; admins can review and resolve reports.  
- AI Chat Integration: Chat interface using an LLM (e.g., OpenAI GPT-4) for contextual Q&A around available materials.  
- Admin Panel: Dedicated interface for user, content, and report management; global settings.  
- Localization: English and one additional language via react-i18next; UI text is fully translatable.  
- Dynamic Content Display: Pagination, filtering, and grid/list toggle views on book listings.  

**Out-of-Scope (Phase 2+):**  
- Video or interactive course modules (only text and PDF content in MVP).  
- Offline reading or mobile-app SDK.  
- Advanced analytics (predictive insights, learning paths recommendations).  
- Multi-tenant support (single instance for all users in MVP).  
- Push notifications or email digests.  
- Built-in testing and assignment modules (quizzes) beyond basic CRUD.

---

## 3. User Flow
When a new visitor arrives, they land on the public homepage showcasing featured books, categories, and a search bar. Unauthenticated users can browse limited content and are prompted to sign up or sign in for full access. After registering via email or a social login, they verify their account, then land on a personalized dashboard. This dashboard displays recommended categories, recent activity, and a left-sidebar navigation menu for browsing, searching, and accessing the AI chat assistant. Clicking a book opens its detail page, where users can read summaries, view metadata, and engage (like, download, or ask the AI for help).

Teachers and administrators access an elevated sidebar with links to the Admin Panel. From there, they can manage users, review reports, configure categories, and perform CRUD operations on books. Reporting flows allow administrators to click into flagged items, see user notes, and either dismiss or remove content. Throughout the experience, React Query handles data fetching and caching, Zustand maintains auth state, and UI components dynamically update without full page reloads.

---

## 4. Core Features
- **Authentication & Authorization**: Email/password login, OAuth, password reset; role-based access (Admin, Teacher, Student).  
- **Book Management**: Full CRUD for books with metadata fields (title, author, ISBN, description, cover image).  
- **Category & Group Management**: Create/edit/delete categories and groups to organize content.  
- **Browsing & Search**: Advanced filters (category, author, tags), pagination, grid/list toggles.  
- **User Interaction Tracking**: Log views, downloads, likes; display basic analytics charts.  
- **Reporting System**: Users flag content; admins review flags in a moderation dashboard.  
- **AI Chat Assistant**: Context-aware chat panel powered by GPT-4 (or similar), with conversation history.  
- **Admin Panel**: User management, content moderation, settings, and report resolution.  
- **Internationalization**: UI text and error messages via `react-i18next`; support for English + one extra language.  
- **Responsive & Accessible UI**: Built with Shadcn UI + Tailwind CSS; meets WCAG 2.1 AA standards.

---

## 5. Tech Stack & Tools
**Frontend**  
- React (UI library)  
- TanStack Router (client-side routing)  
- Shadcn UI + Tailwind CSS (component library & styling)  
- React Query (@tanstack/react-query) for data fetching/caching  
- Zustand for global state (auth, UI preferences)  
- React Hook Form + Zod for form handling & validation  
- react-i18next for internationalization  
- Vite (bundler) & pnpm (package manager)  
- TypeScript (static typing)  
- Biome (formatting & linting)

**Backend**  
- Node.js + Fastify (high-performance web server)  
- PostgreSQL (relational database)  
- Drizzle ORM (TypeScript-first database access)  
- `better-auth` (authentication middleware)  
- @fastify plugins (cors, helmet, rate-limit, multipart, swagger)  
- Sharp (image processing)  
- Swagger/Scalar for API docs  
- TypeScript  

**AI & Integrations**  
- OpenAI GPT-4 (chat assistant) or equivalent  
- API keys managed via environment variables  

**IDE & Developer Tools**  
- VS Code + Cursor/Windsurf (AI coding assistant plugins)  
- Git for version control  
- Docker (optional local dev environment)

---

## 6. Non-Functional Requirements
- **Performance**: API endpoints should respond in <200ms for simple reads; initial page load <1.5s on 3G.  
- **Scalability**: Support 10,000+ concurrent users; horizontally scalable backend.  
- **Security**: OWASP Top 10 protections (helmet, rate limiting, input validation); HTTPS everywhere; secure session cookies.  
- **Compliance**: GDPR-compliant user data handling; proper cookie consent.  
- **Usability**: WCAG 2.1 AA accessibility; responsive design for mobile/desktop.  
- **Reliability**: 99.9% uptime target; health checks and auto-restarts for server processes.

---

## 7. Constraints & Assumptions
- Requires Node.js v14+ and PostgreSQL v12+ environments.  
- OpenAI (or chosen LLM) API keys must be provisioned and accessible via environment variables.  
- Hosting on AWS/GCP/Vercel with adequate CPU/memory for Fastify.  
- Assumes stable internet for API calls; fallback messaging if AI service rate limit is reached.  
- Drizzle ORM migrations must be run manually or via CI during deployments.

---

## 8. Known Issues & Potential Pitfalls
- **AI Rate Limiting**: Hitting OpenAI rate limits could degrade chat; mitigate with request queuing and caching common Q&A.  
- **Large File Uploads**: Image or PDF uploads may time out; use streaming uploads or chunking via Fastify multipart.  
- **DB Indexing**: Missing indexes on search/filter fields can slow queries; ensure proper indexing on `category`, `author`, and `tags`.  
- **Auth Token Expiry**: Incomplete refresh-token flows could log users out unexpectedly; implement silent token refresh.  
- **i18n Maintenance**: Adding new UI text requires updates to translation files; adopt a clear process for translators.  
- **Accessibility Gaps**: Custom components may lack ARIA labels; perform a full A11y audit before launch.

---

This completes the Project Requirements Document for "sicerdas." It captures all core functionality, technology choices, and constraints so that subsequent technical documents can be generated without ambiguity.