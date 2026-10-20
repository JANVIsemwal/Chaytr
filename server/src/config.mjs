import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const env = process.env;

const isProd = env.NODE_ENV === 'production';

export const config = {
  isProd,
  port: Number(env.PORT || 4000),
  appName: env.APP_NAME || 'Chaytr',
  /** Public address of the website, used to build links in emails. */
  appUrl: (env.APP_URL || 'http://localhost:8081').replace(/\/$/, ''),
  /** Browser origins allowed to call the API (comma separated). */
  allowedOrigins: (env.CORS_ORIGIN || 'http://localhost:8081')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
  dbPath: env.DB_PATH || path.join(here, '..', 'data', 'chaytr.db'),
  /** The built website (npm run build:web). Served by this server when present. */
  distDir: env.DIST_DIR || path.join(here, '..', '..', 'dist'),
  cookieSecure: env.COOKIE_SECURE ? env.COOKIE_SECURE === 'true' : isProd,
  sessionDays: 30,
  resetLinkMinutes: 60,
  smtp: {
    host: env.SMTP_HOST || '',
    port: Number(env.SMTP_PORT || 587),
    user: env.SMTP_USER || '',
    // Gmail shows app passwords in groups of four ("abcd efgh ..."); the spaces aren't part of it.
    pass: /gmail\.com$/i.test(env.SMTP_HOST || '') ? (env.SMTP_PASS || '').replace(/\s+/g, '') : env.SMTP_PASS || '',
    from: env.MAIL_FROM || `${env.APP_NAME || 'Chaytr'} <no-reply@example.com>`,
  },
  /** Where contact-form notifications go (optional). */
  contactTo: env.CONTACT_TO || '',
};
