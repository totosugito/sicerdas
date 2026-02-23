import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, openAPI, emailOTP, multiSession, customSession } from 'better-auth/plugins';
import { db } from './db/db-pool.ts';
import envConfig from "./config/env.config.ts";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Brevo email client
import { BrevoClient } from '@getbrevo/brevo';
import { getUserAvatarUrl } from './utils/app-utils.ts';
import { eq } from 'drizzle-orm';

// Initialize Brevo API client if API key is provided
let brevo: BrevoClient | null = null;
if (envConfig.email?.brevo?.apiKey) {
  brevo = new BrevoClient({
    apiKey: envConfig.email.brevo.apiKey,
  });
}

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    usePlural: true,
  }),
  plugins: [
    admin(),
    openAPI({
      path: '/docs',
    }),
    customSession(async ({ user, session }) => {
      // get user role from database
      const userRecord = await db.query.users.findFirst({
        where: (fields) => eq(fields.id, user.id),
      });

      return {
        user: {
          ...user,
          role: userRecord?.role || 'user',
          image: getUserAvatarUrl(user.image),
        },
        session
      };
    }),
    multiSession(),
    emailOTP({
      otpLength: 6,
      expiresIn: 60 * 60, // 1 hour
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "sign-in") {
          // Send the OTP for sign in
        } else if (type === "email-verification") {
          // Send the OTP for email verification
        } else {
          // Send the OTP for password reset
          // Only send email if Brevo is configured
          if (!brevo) {
            console.warn('Brevo API key not configured. Skipping email sending.');
            return Promise.resolve();
          }

          try {
            // Read the email template
            const templatePath = path.join(__dirname, 'templates', 'reset-password-otp.html');
            let htmlContent = fs.readFileSync(templatePath, 'utf8');

            // Replace placeholders with actual values
            htmlContent = htmlContent
              .replace(/{{name}}/g, email.split('@')[0]) // Using email prefix as name
              .replace(/{{email}}/g, email)
              .replace(/{{otp}}/g, otp)
              .replace(/{{year}}/g, new Date().getFullYear().toString());

            // Send email
            await brevo.transactionalEmails.sendTransacEmail({
              subject: 'Kode OTP Reset Kata Sandi',
              htmlContent: htmlContent,
              sender: {
                name: 'SiCerdas No-Reply',
                email: 'no-reply@sicerdas.com'
              },
              to: [{
                email: email,
                name: email.split('@')[0],
              }]
            });
          } catch (error) {
            console.error('Failed to send password reset OTP email:', error);
            // We don't reject the promise as we don't want to break the auth flow
          }
        }
      },
    }),
  ],
  socialProviders: {
    google: {
      prompt: "select_account",
      clientId: envConfig.oauth?.google?.clientId || "",
      clientSecret: envConfig.oauth?.google?.clientSecret || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 1 week
    updateAge: 60 * 60 * 24, // 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds
    },
  },
  emailAndPassword: {
    enabled: true,
    disableSignUp: false,
    requireEmailVerification: false,
    minPasswordLength: 1,
    maxPasswordLength: 128,
    autoSignIn: false,
    sendResetPassword: async ({ user, url, token }, request) => {
      // Only send email if Brevo is configured
      if (!brevo) {
        console.warn('Brevo API key not configured. Skipping email sending.');
        return Promise.resolve();
      }

      try {
        // Read the email template
        const templatePath = path.join(__dirname, 'templates', 'request-password-reset.html');
        let htmlContent = fs.readFileSync(templatePath, 'utf8');

        // Replace placeholders with actual values
        htmlContent = htmlContent
          .replace(/{{name}}/g, user.name || user.email)
          .replace(/{{email}}/g, user.email)
          .replace(/{{resetLink}}/g, url)
          .replace(/{{year}}/g, new Date().getFullYear().toString());

        // Send email
        await brevo.transactionalEmails.sendTransacEmail({
          subject: 'Reset Password',
          htmlContent: htmlContent,
          sender: {
            name: 'SiCerdas No-Reply', // envConfig.email.noReply.name,
            email: 'no-reply@sicerdas.com' //envConfig.email.noReply.email
          },
          to: [{
            email: user.email,
            name: user.name || user.email,
          }]
        });
        // console.info(`Password reset email sent to ${user.email}`);
      } catch (error) {
        console.error('Failed to send password reset email:', error);
        // We don't reject the promise as we don't want to break the auth flow
      }
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },

  advanced: {
    cookiePrefix: envConfig.server.cookiePrefix, // the data cookies saved on client side will be prefixed with this prefix
    database: {
      generateId: false,
    },
  },
  trustedOrigins: envConfig.server.trustedOrigins,
  secretKey: envConfig.server.secretKey,
  debug: false,
});

export type User = typeof auth.$Infer.Session.user;
export type Session = typeof auth.$Infer.Session;

export default auth;