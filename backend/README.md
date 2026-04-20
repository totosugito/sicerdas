## SCHEDULE JOB

```bash
npx ts-node src/scripts/schedule/daily.ts
```

## A. DB PREPARATION

Create postgres user and create the database _sicerdas_

```
psql -U postgres
CREATE USER sicerdas WITH PASSWORD 'a';
ALTER USER sicerdas WITH CREATEDB LOGIN;
ALTER USER sicerdas WITH SUPERUSER;
```

## B. Backend Setup

### 1. Clone this repo & install dependencies

`npm install`

### 2. Create Table schema

`npm run db:generate`

### 3. create the database and push schema to database

`npm run db:push`

### 4. create default data

```
npm run db:db:init_data
npm run db:db:init_user
```

### 4. Start the Fastify server as development mode

```
npm run dev
```

### 5. Building

```
npm run build
```

## C. BETTER-AUTH API Documentation

better-auth api documentation

1. _/auth/sign-in_ – [POST] - Sign in via email, password, social providers, or passkey (WebAuthn)
2. _/auth/sign-up_ – [POST] - New account registration, with additional fields supported
3. _/auth/request-password-reset_ – [POST] (email, redirectTo) - Trigger password reset email
4. _/auth/reset-password_ – [POST] (newPassword, token) - Allow users to reset forgotten passwords
5. _/auth/sign-out_ – [POST] - Log out action
6. _/auth/get-session_ – [GET] - Get current session information (authentication required)

note:

- _sign-in_ and _sign-up_ : add ...api*path/\_email* when the user try to call api from emailAndPassword login method.

Reset password flow

1. send request to /request-password-reset endpoint.
2. get token from email link.
3. call /reset-password endpoint with new password and token.

## D. Backup

### 1. Backup

pg*dump -U postgres -d sicerdas | pv | gzip > sicerdas*$(date +%F).sql.gz
C:/laragon/bin/postgresql/postgresql-18.0-2/bin/pg_dump.exe -U postgres -d sicerdas | pv | gzip > sicerdas_$(date +%F).sql.gz

### 2. Restore

pv sicerdas_2025-08-27.sql.gz | gunzip | psql -h localhost -U postgres -d sicerdas

## E. Deployment & Production Release

To deploy the backend to a production server, you do not need the full source code. Only the compiled output and configuration files are necessary.

### 1. Files to Copy

Copy the following files and directories to your server:

- `dist/` (The compiled JavaScript)
- `package.json`
- `package-lock.json` (or `pnpm-lock.yaml`)
- `src/db/migrations/` (Required for running database migrations)
- `.env` (Your production environment variables)

### 2. Installation & Setup

On the server, install only production dependencies:

```bash
# If using npm
npm install --omit=dev

# If using pnpm
pnpm install --prod
```

### 3. Database Migrations

If you've made database changes, run the migrations:

```bash
npm run db:migrate
```

### 4. Start the Server

Run the application using the production start script:

```bash
npm run start
```

### 5. Using PM2 (Recommended)

For production, it is highly recommended to use a process manager like **PM2** to keep the app running in the background and restart it automatically if it crashes.

- **Start with PM2**:

  ```bash
  pm2 start dist/server.js --name "sicerdas-backend"
  ```

- **Monitor Logs**:

  ```bash
  pm2 logs sicerdas-backend
  ```

- **Stop/Restart**:
  ```bash
  pm2 restart sicerdas-backend
  pm2 stop sicerdas-backend
  ```

### 6. Sync education category stats

```bash
npx cross-env NODE_ENV=development npx tsx src/scripts/init/jobs/sync-education-stats.ts
```
