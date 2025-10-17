import FastifyCookie, { type FastifyCookieOptions } from '@fastify/cookie';

export const autoConfig: FastifyCookieOptions = {
  secret: process.env.COOKIE_SECRET || 'sicerdas-cookie-secret', // Use a proper secret in production
};

export default FastifyCookie;