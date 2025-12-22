# Backend Structure Document - sicerdas

This document describes the backend setup for the sicerdas Learning Management System (LMS). It covers the architecture, database, APIs, hosting, infrastructure, security, and maintenance practices in clear, everyday language.

## 1. Backend Architecture

- **Overall Design**  
  The backend uses a service-oriented approach built on Node.js and Fastify. Fastify provides a lightweight, plugin-based web server that handles requests and routes them to specific handlers.

- **Key Frameworks and Patterns**  
  • Fastify plugins organize middleware (CORS, security headers, file uploads, rate limiting)  
  • TypeScript for type safety from end to end  
  • Drizzle ORM for type-safe database operations  
  • Modular directory layout (plugins, routes, database, utilities)

- **Scalability**  
  • Fastify’s low overhead allows high throughput  
  • Horizontal scaling by running multiple Node.js instances behind a load balancer  
  • Stateless request handling (session data stored in Redis or database)

- **Maintainability**  
  • Clear separation of concerns (authentication, business logic, database)  
  • Strong typing reduces bugs  
  • Plugin-based architecture makes it easy to add or remove features

- **Performance**  
  • Built-in Fastify support for HTTP/2 and JSON serialization  
  • Database connection pooling via `pg`  
  • Caching strategies (detailed in Section 6)

## 2. Database Management

- **Technology**  
  • PostgreSQL (relational SQL database)  
  • Drizzle ORM for schema definitions, migrations, and queries

- **Data Storage and Access**  
  • Tables store core entities: users, roles, books, categories, groups, interactions, reports  
  • JSONB columns used for flexible "extra" data (e.g., book metadata, report details)  
  • Connection pooling to manage database connections efficiently

- **Data Management Practices**  
  • Migrations handled by Drizzle Kit to apply schema changes consistently across environments  
  • Daily backups of the PostgreSQL database  
  • Indexing on frequently queried columns (e.g., `user_id`, `book_id`, `created_at`)

## 3. Database Schema

Below is a high-level, human-readable view of the main tables. A more detailed SQL schema follows.

- **Users**: Stores account information and roles.  
  Fields: ID, email, hashed password, name, role, created_at, updated_at

- **Books**: Core content items.  
  Fields: ID, title, author, category_id, group_id, description, extra (JSONB), created_at, updated_at

- **Categories**: Organize books into broad topics.  
  Fields: ID, name, description

- **Groups**: Sub-categories or course groupings.  
  Fields: ID, name, category_id

- **Interactions**: Tracks user views, downloads, and likes.  
  Fields: ID, user_id, book_id, type, timestamp

- **Reports**: User-submitted issues or moderation requests.  
  Fields: ID, user_id, target_type, target_id, reason (text), extra (JSONB), status, created_at

- **ChatHistory**: Stores AI chat messages for context.  
  Fields: ID, user_id, user_message, ai_response, timestamp

### SQL Schema (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id              SERIAL PRIMARY KEY,
  email           TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  name            TEXT,
  role            TEXT NOT NULL DEFAULT 'user',
  created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Categories
CREATE TABLE categories (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT
);

-- Groups
CREATE TABLE groups (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL,
  category_id  INTEGER REFERENCES categories(id)
);

-- Books
CREATE TABLE books (
  id           SERIAL PRIMARY KEY,
  title        TEXT NOT NULL,
  author       TEXT,
  category_id  INTEGER REFERENCES categories(id),
  group_id     INTEGER REFERENCES groups(id),
  description  TEXT,
  extra        JSONB,
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Interactions
CREATE TABLE interactions (
  id         SERIAL PRIMARY KEY,
  user_id    INTEGER REFERENCES users(id),
  book_id    INTEGER REFERENCES books(id),
  type       TEXT NOT NULL,          -- e.g., 'view', 'download', 'like'
  timestamp  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports
CREATE TABLE reports (
  id           SERIAL PRIMARY KEY,
  user_id      INTEGER REFERENCES users(id),
  target_type  TEXT NOT NULL,         -- e.g., 'book', 'comment'
  target_id    INTEGER NOT NULL,
  reason       TEXT NOT NULL,
  extra        JSONB,
  status       TEXT NOT NULL DEFAULT 'pending',
  created_at   TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat History
CREATE TABLE chat_history (
  id            SERIAL PRIMARY KEY,
  user_id       INTEGER REFERENCES users(id),
  user_message  TEXT NOT NULL,
  ai_response   TEXT NOT NULL,
  timestamp     TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. API Design and Endpoints

- **Approach**  
  • RESTful API built with Fastify  
  • Input and output validated via JSON schemas (Zod)  
  • Versioned routes under `/api/v1/` for backward compatibility

- **Authentication**  
  • `/api/v1/auth/signup` – create new account  
  • `/api/v1/auth/login` – sign in and issue session token/cookie  
  • `/api/v1/auth/logout` – invalidate session

- **User Management**  
  • GET `/api/v1/users/me` – fetch user profile  
  • PUT `/api/v1/users/me` – update profile details  
  • Admin-only routes to list, promote, or deactivate users

- **Content (Books/Categories/Groups)**  
  • GET `/api/v1/books` – list books with filters and pagination  
  • POST `/api/v1/books` – create a new book (admin/teacher)  
  • GET `/api/v1/books/:id` – fetch a book by ID  
  • PUT `/api/v1/books/:id` – update book details  
  • DELETE `/api/v1/books/:id` – remove a book

- **Interactions**  
  • POST `/api/v1/interactions` – record view/download/like  
  • GET `/api/v1/interactions/stats` – fetch usage analytics

- **Reporting**  
  • POST `/api/v1/reports` – submit a report  
  • GET `/api/v1/reports` – admin fetch pending reports  
  • PUT `/api/v1/reports/:id` – update report status

- **AI Chat**  
  • POST `/api/v1/chat` – send user message, receive AI response

- **Documentation**  
  • `/api/docs` – Swagger UI for interactive API docs

## 5. Hosting Solutions

- **Cloud Provider**  
  • Hosted on AWS:  
    – **EC2/ECS** for running Node.js services  
    – **RDS (PostgreSQL)** for managed database  
    – **S3** for storing book cover images and uploads

- **Benefits**  
  • High availability with multiple availability zones  
  • Automatic database backups and failover  
  • Pay-as-you-go pricing for cost control  
  • Easy scaling through container orchestration (ECS/EKS)

## 6. Infrastructure Components

- **Load Balancer**  
  • AWS Application Load Balancer distributes traffic across service instances

- **Caching**  
  • Redis for session storage and hot data caching (e.g., popular book lists)  
  • In-memory cache on the Fastify server for short-lived lookups

- **Content Delivery Network (CDN)**  
  • CloudFront to deliver static assets (book images, front-end bundle) with low latency

- **File Storage**  
  • S3 for large file storage, with lifecycle rules to archive old files

- **Background Jobs**  
  • AWS SQS + Lambda or a worker process to handle long-running tasks (e.g., image resizing with `sharp`)

## 7. Security Measures

- **Authentication & Authorization**  
  • `better-auth` plugin for session and social login support  
  • Role-based access control (admin, teacher, user)

- **Encryption**  
  • TLS/HTTPS enforced on all API endpoints  
  • Database connections use SSL  
  • Sensitive data (passwords) hashed with bcrypt or Argon2

- **Request Hardening**  
  • Rate limiting to prevent brute-force attacks  
  • Helmet sets secure HTTP headers  
  • CORS configured to allow only trusted origins

- **Input Validation**  
  • Zod schemas validate all incoming data  
  • SQL injection prevention through parameterized queries in Drizzle ORM

- **Secrets Management**  
  • Environment variables stored in AWS Secrets Manager or a secure vault  
  • No secret keys in code repository

## 8. Monitoring and Maintenance

- **Monitoring Tools**  
  • Prometheus/Grafana for real-time metrics (CPU, memory, request rates)  
  • Sentry for error tracking and alerting  
  • AWS CloudWatch for logs and alarms

- **Maintenance Practices**  
  • Automated database backups with point-in-time recovery  
  • Health-check endpoints for load balancer and auto-healing  
  • Scheduled dependency updates and security patching  
  • Continuous integration pipeline runs linting, type checks, and tests on every commit

## 9. Conclusion and Overall Backend Summary

The sicerdas backend is a modern, modular Node.js application optimized for performance, scalability, and maintainability. It uses Fastify for fast request handling, PostgreSQL with Drizzle ORM for structured and type-safe data management, and a set of well-integrated AWS services for hosting and scaling. Comprehensive security, monitoring, and maintenance practices ensure the system remains reliable and secure. By following this structure, the platform can grow its content library, user base, and feature set with confidence and minimal friction.