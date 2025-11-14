import dotenv from 'dotenv';

export const LogLevel = {
  trace: 'trace',
  debug: 'debug',
  info: 'info',
  warn: 'warn',
  error: 'error',
} as const;
export const schema = Type.Object({
  VERSION: Type.String({default: '0.0.0'}),
  POSTGRES_HOST: Type.String(),
  POSTGRES_USER: Type.String(),
  POSTGRES_PASSWORD: Type.String(),
  POSTGRES_DB: Type.String(),
  POSTGRES_PORT: Type.Number({default: 5432}),
  LOG_LEVEL: Type.Enum(LogLevel),
  HOST: Type.String({default: 'localhost'}),
  PORT: Type.Number({default: 5550}),
  PROTOCOL: Type.String({default: 'http'}), 
  FRONTEND_URL: Type.String({default: 'http://localhost:5573'}),
  COOKIE_PREFIX: Type.String({default: 'cookie'}),
  BETTER_AUTH_SECRET: Type.String({default: 'secret'}),
  GOOGLE_CLIENT_ID: Type.Optional(Type.String()),
  GOOGLE_CLIENT_SECRET: Type.Optional(Type.String()),
  BREVO_API_KEY: Type.Optional(Type.String()),
  NO_REPLY_EMAIL: Type.Optional(Type.String()),
  NO_REPLY_EMAIL_NAME: Type.Optional(Type.String()),
});

// Delete only keys defined in schema from process.env
for (const key of Object.keys(schema.properties)) {
  delete process.env[key];
}

// set env file
dotenv.config({path: process.env.NODE_ENV === 'development' ? '.env.devel' : '.env'});

import {type Static, Type} from '@sinclair/typebox';
import envSchema from 'env-schema';

const env = envSchema<Static<typeof schema>>({
  dotenv: false,
  schema,
});

const uploadsUrl = process.env.NODE_ENV === 'development' ? `${env.PROTOCOL}://${env.HOST}:${env.PORT}/uploads` : `${env.PROTOCOL}://${env.FRONTEND_URL}/uploads`;
export default {
  version: env.VERSION ?? '0.0.0',
  log: {
    level: env.LOG_LEVEL,
  },
  server: {
    cookiePrefix: env.COOKIE_PREFIX,
    secretKey: env.BETTER_AUTH_SECRET,
    host: env.HOST,
    port: env.PORT,
    frontendUrl: env.FRONTEND_URL,
    uploadsUrl: uploadsUrl,
    uploadsUserDir: `${uploadsUrl}/users`,
    trustedOrigins: [
      env.HOST,
      `${env.PROTOCOL}://${env.HOST}:${env.PORT}`,
      `${env.PROTOCOL}://${env.FRONTEND_URL}`,
    ],
  },
  oauth: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  email: {
    brevo: {
      apiKey: env.BREVO_API_KEY,
    },
    noReply: {
      email: env.NO_REPLY_EMAIL,
      name: env.NO_REPLY_EMAIL_NAME,
    },
  },
  db: {
    url: `postgresql://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
  },
};