# Security Guidelines for Sicerdas LMS

This document outlines the security principles and concrete recommendations tailored for the **Sicerdas** repository, a full-stack Learning Management System (LMS). By embedding these practices throughout design, development, testing, and operations, we help ensure the confidentiality, integrity, and availability of educational content and user data.

---

## 1. Authentication & Access Control

- **Strong Password Policies**
  - Enforce a minimum length (e.g., ≥ 12 characters), mixed case, numbers, and symbols.
  - Use bcrypt or Argon2 with per-user unique salts for hashing.
- **Multi-Factor Authentication (MFA)**
  - Offer TOTP or hardware token MFA for administrator and teacher accounts.
- **Session Management**
  - Generate cryptographically secure, unguessable session IDs.
  - Store sessions in a hardened store (e.g., Redis) with idle and absolute timeouts.
  - Regenerate session IDs on privilege elevation (e.g., login).
  - Invalidate sessions fully on logout.
- **JWT Best Practices** (if tokens are used)
  - Always specify and validate the `alg` (avoid `none`).
  - Set a reasonable expiration (`exp`) and implement refresh tokens securely.
  - Store tokens in HttpOnly, Secure cookies—not in localStorage.
- **Role-Based Access Control (RBAC)**
  - Define least-privilege roles: `admin`, `teacher`, `user`.
  - Centralize permission checks on the server side before each CRUD operation (books, reports, user data).
  - Enforce immutable role assignments and audit any changes.

---

## 2. Input Handling & Data Validation

- **Server-Side Validation**
  - Leverage Zod schemas in both Fastify routes and React Hook Form to validate all inputs (body, query, params) before processing or database access.
- **SQL Injection Prevention**
  - Always use Drizzle ORM or parameterized queries—never string-concatenate user input in SQL.
- **NoSQL/Command Injection**
  - Reject unexpected fields and use strict whitelisting of request properties.
- **File Upload Security**
  - Validate MIME types, file extensions, and maximum file size.
  - Store uploads outside the webroot and rename files to a secure, randomized identifier.
  - Scan files for malware when possible (e.g., integrate an antivirus API).
- **Template & Script Injection**
  - Escape or sanitize any user-provided HTML or markdown before rendering in chats or forums.
  - Implement a strict Content Security Policy (CSP) that restricts inline scripts and untrusted origins.

---

## 3. Web Application Hardening

- **Secure HTTP Headers**
  - Content-Security-Policy: restrict sources for scripts, styles, images.
  - Strict-Transport-Security: `max-age=31536000; includeSubDomains; preload`.
  - X-Frame-Options: `DENY` or `SAMEORIGIN` to prevent clickjacking.
  - X-Content-Type-Options: `nosniff` to block MIME sniffing.
  - Referrer-Policy: `no-referrer-when-downgrade` (or stricter).
- **Cross-Site Request Forgery (CSRF)**
  - Use synchronizer tokens for all state-changing POST/PUT/DELETE requests.
  - Scope cookies with `SameSite=Strict` or `Lax`.
- **Secure Cookies**
  - Always set `HttpOnly`, `Secure`, and appropriate `SameSite` attributes.
- **CORS Configuration**
  - Allow only trusted frontend origins. Avoid wildcards.
  - Explicitly enable only necessary HTTP methods and headers.

---

## 4. API & Service Security

- **Enforce HTTPS**
  - Redirect all HTTP traffic to HTTPS.
  - Use valid certificates (Let’s Encrypt or commercial CA).
- **Rate Limiting & Throttling**
  - Protect login, password-reset, and chat endpoints with per-user or per-IP limits.
- **Versioned Endpoints**
  - Prefix APIs with `/v1/` (and plan `/v2/`), deprecate old versions securely.
- **Principle of Least Data Exposure**
  - Return only the fields required by the frontend.
  - Mask or redact PII in logs and non-privileged API responses.
- **Logging & Monitoring**
  - Centralize logs (e.g., ELK stack) and monitor for unusual patterns: failed logins, high error rates, spike in file uploads.
  - Maintain audit trails for administrative actions.

---

## 5. Data Protection & Privacy

- **Encryption in Transit**
  - TLS 1.2+ with strong cipher suites (disable SSLv3/TLS 1.0/1.1).
- **Encryption at Rest**
  - Enable full-disk encryption on database servers.
  - Use field-level encryption for especially sensitive fields (e.g., PII) if required by regulations.
- **PII Handling & Compliance**
  - Store only necessary PII. Document retention policies in line with GDPR/CCPA.
  - Provide mechanisms for users to view, export, and delete their personal data.
- **Secrets Management**
  - Store API keys, DB credentials, JWT secrets in a secrets manager (e.g., AWS Secrets Manager, Vault).
  - Rotate secrets periodically and on suspected compromise.

---

## 6. Infrastructure & Configuration

- **Server Hardening**
  - Disable unused services and ports.
  - Apply the latest OS and library patches regularly.
  - Use Docker or container orchestration with minimal base images.
- **Configuration Management**
  - Keep separate configurations for `development`, `staging`, and `production`.
  - Do not commit credentials or `.env` files to source control.
- **Secure Deployments**
  - Automate deployments through a CI/CD pipeline with access controls and approval gates.
  - Run vulnerability scanners (SAST) on every pull request.

---

## 7. Dependency Management

- **Lockfiles & Pinning**
  - Commit `pnpm-lock.yaml` to ensure deterministic builds.
- **Vulnerability Scanning**
  - Integrate SCA tools (e.g., Dependabot, Snyk) to detect known CVEs in dependencies.
- **Minimize Footprint**
  - Audit and remove unused or unmaintained packages, especially those pulling in native binaries.

---

## 8. Testing, Auditing & Incident Response

- **Security Testing**
  - Incorporate unit and integration tests for authentication, file uploads, and input validation.
  - Use penetration testing tools or services periodically.
- **Code Reviews**
  - Mandate peer reviews with a security checklist (e.g., OWASP Top 10) before merging.
- **Incident Response Plan**
  - Document steps for breach detection, containment, eradication, and recovery.
  - Define communication plans for affected stakeholders.

---

## Conclusion
Adherence to these guidelines will significantly reduce risk and enhance the trustworthiness of the Sicerdas platform. Review and update this document regularly to reflect evolving threats, regulatory changes, and new architectural decisions.