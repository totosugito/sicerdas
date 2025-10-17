# Tech Stack Document for Sicerdas

This document explains the technology choices behind Sicerdas, a full-stack Learning Management System (LMS). It’s written in everyday language so anyone can understand why each tool was chosen and how it helps deliver a reliable, fast, and user-friendly platform.

## Frontend Technologies

We built the user interface using modern JavaScript tools that make the app fast, responsive, and easy to maintain.

**Key Technologies:**
- React: A popular library for building dynamic web interfaces. It lets us split the UI into reusable pieces called components.
- TypeScript: Adds optional typing to JavaScript. It helps catch errors early and makes the code easier to understand and refactor.
- Vite: A development server and build tool that starts and refreshes very quickly during development.
- pnpm: A fast, disk-efficient package manager for keeping track of code libraries.
- Shadcn UI (Tailwind CSS + Radix UI): Provides ready-made, customizable UI components with consistent styling and accessibility baked in.
- Tailwind CSS: A utility-first CSS framework that speeds up styling by letting us apply design classes directly in code.
- TanStack Router: Manages navigation within the app, keeping URLs in sync with what users see on screen.
- Zustand: A lightweight solution for managing global state (for example, whether a user is logged in).
- React Hook Form: Simplifies form handling and validation, making forms snappy and easy to build.
- React Query (@tanstack/react-query): Handles data fetching and caching, so the UI stays in sync with the server without manual refreshing.
- Zod: Defines and enforces data shapes, ensuring we only work with valid information.
- react-i18next: Provides built-in support for multiple languages, making localization straightforward.

**How This Helps Users:**
- Fast page loads and instant feedback thanks to Vite and React’s virtual DOM.
- Clear, consistent look and feel with Shadcn UI and Tailwind.
- Smooth navigation and data updates without full page reloads.
- Built-in language support so learners worldwide can use the platform in their native tongue.

## Backend Technologies

The backend powers the data, security, and business logic. We chose tools that deliver high performance and strong type safety.

**Key Technologies:**
- Node.js with Fastify: A lightweight, high-speed server framework that handles requests quickly and scales well.
- TypeScript: Ensures consistent types between server code and the database layer.
- PostgreSQL: A reliable relational database for storing users, books, categories, and analytics data.
- Drizzle ORM: A modern, type-safe way to interact with the database, reducing SQL errors.
- better-auth: Handles user authentication, sessions, password resets, and social logins.
- @fastify Plugins (cors, helmet, multipart, rate-limit, sensible, swagger, under-pressure): Add security headers, file uploads, cross-origin support, rate limiting, documentation, and built-in health checks.
- pg: The PostgreSQL driver that connects our Node.js server to the database.
- sharp: Processes and optimizes images (for book covers) on the fly.
- Swagger & Scalar API Reference: Auto-generates and serves up-to-date API docs for developers.

**How These Work Together:**
1. A client request hits our Fastify server.
2. Authentication and data-validation happen automatically via better-auth and Fastify schemas.
3. Business logic runs (for example, fetching a book list), using Drizzle to talk to PostgreSQL.
4. Results are sent back as clean JSON, ready for React Query to display.

## Infrastructure and Deployment

We rely on standard cloud and code-management practices to keep Sicerdas stable, scalable, and easy to update.

**Key Practices and Tools:**
- Git & GitHub: Source code version control and collaboration.
- CI/CD Pipelines (e.g., GitHub Actions): Automatically run tests and deploy updates when code is merged.
- Container-friendly Setup: The app can be packaged with Docker or run directly on cloud servers.
- Cloud Hosting (e.g., AWS, Heroku, Vercel, Netlify): Frontend and backend can be deployed independently for scalability.

**Benefits:**
- Every code change is tested and reviewed before going live.
- Rolling back to a previous version is straightforward.
- Frontend and backend scale automatically based on demand.

## Third-Party Integrations

Sicerdas connects to several external services to extend its capabilities without reinventing the wheel.

**Notable Integrations:**
- AI Chat Service (via REST API): Powers the interactive AI tutor feature, letting learners ask questions and get instant help.
- OAuth Providers (through better-auth): Allows users to sign in with Google, Facebook, or other social accounts.
- i18next: Manages text translations and locale switching.
- Swagger/Scalar: Publishes interactive API documentation for developers.

**Why These Matter:**
- AI chat adds real-time assistance without building a custom machine-learning system.
- Social login simplifies onboarding by letting users sign up with existing accounts.
- Automatic translation support broadens the user base globally.
- Clear API documentation speeds up onboarding for integrators and future developers.

## Security and Performance Considerations

We’ve baked in security and speed from the ground up.

**Security Measures:**
- Role-Based Access Control: Users, teachers, and admins see only what they’re allowed to see.
- HTTPS-ready Headers: Using Helmet to enforce best practices for web security.
- Rate Limiting & Under-Pressure Checks: Protects the server from overload and abuse.
- Data Validation: Zod and Fastify schemas ensure only valid data enters the system.
- Session Management: better-auth handles secure session storage and token renewal.

**Performance Optimizations:**
- Fastify: One of the fastest Node.js web frameworks.
- React Query Caching: Reduces redundant network requests.
- Vite’s Fast Reloading: Speeds up development and delivers lean production bundles.
- sharp Image Resizing: Delivers optimized images based on device needs.
- Database Indexing & JSONB Columns: Ensures queries run quickly, even as data grows.

## Conclusion and Overall Tech Stack Summary

Sicerdas combines modern, well-supported technologies across the stack to deliver a fast, secure, and user-friendly educational platform. Our choices reflect these priorities:

- **User Experience:** React, Shadcn UI, and Tailwind make the interface responsive and consistent.
- **Developer Productivity:** TypeScript, Vite, and Drizzle ORM reduce bugs and speed up new feature work.
- **Scalability & Reliability:** Fastify, PostgreSQL, and cloud-friendly deployment practices keep the system humming under load.
- **Global Reach:** i18next and a modular design support multiple languages and easy expansion.

Unique to Sicerdas is its blend of AI-assisted learning with full content-management and reporting capabilities, all built on a type-safe, plugin-driven foundation. This stack positions us to grow quickly, maintain high quality, and offer an engaging experience for learners and educators alike.