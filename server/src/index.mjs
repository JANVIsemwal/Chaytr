import fs from 'node:fs';
import path from 'node:path';

import express from 'express';

import { config } from './config.mjs';
import { cleanUp, db } from './db.mjs';
import { mailEnabled, resetPasswordEmail, sendMail } from './mail.mjs';
import { burnTime, hashPassword, hashToken, isEmail, newId, newToken, normaliseEmail, rateLimiter, verifyPassword } from './security.mjs';

const app = express();
app.set('trust proxy', 1); // correct client IPs behind a host's proxy (rate limiting)
app.disable('x-powered-by');

const COOKIE = 'chaytr_session';
const DAY = 24 * 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS for the dev website (and any other allowed origin), with cookies.
app.use('/api', (req, res, next) => {
  const origin = req.headers.origin;
  if (origin && config.allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Vary', 'Origin');
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Basic CSRF protection: state-changing requests must come from our own pages.
app.use('/api', (req, res, next) => {
  if (req.method !== 'POST') return next();
  const origin = req.headers.origin;
  let sameHost = false;
  try {
    sameHost = Boolean(origin) && new URL(origin).host === req.headers.host;
  } catch {}
  if (origin && !sameHost && !config.allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: 'Request blocked.' });
  }
  if (!req.is('application/json')) return res.status(415).json({ error: 'Expected JSON.' });
  next();
});

app.use(express.json({ limit: '20kb' }));

function readCookie(req, name) {
  const header = req.headers.cookie || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return null;
}

function setSessionCookie(res, token, maxAgeSeconds) {
  const parts = [`${COOKIE}=${token}`, 'Path=/', 'HttpOnly', 'SameSite=Lax', `Max-Age=${maxAgeSeconds}`];
  if (config.cookieSecure) parts.push('Secure');
  res.setHeader('Set-Cookie', parts.join('; '));
}

const publicUser = (u) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.created_at });

function startSession(res, userId) {
  const token = newToken();
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)').run(
    hashToken(token),
    userId,
    Date.now() + config.sessionDays * DAY,
    new Date().toISOString(),
  );
  setSessionCookie(res, token, config.sessionDays * 24 * 60 * 60);
}

function currentUser(req) {
  const token = readCookie(req, COOKIE);
  if (!token) return null;
  return (
    db
      .prepare(
        `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
         WHERE s.token_hash = ? AND s.expires_at > ?`,
      )
      .get(hashToken(token), Date.now()) ?? null
  );
}

const loginLimit = rateLimiter(10, 15 * 60 * 1000);
const signupLimit = rateLimiter(10, 60 * 60 * 1000);
const forgotLimit = rateLimiter(5, 60 * 60 * 1000);
const contactLimit = rateLimiter(10, 60 * 60 * 1000);
const tooMany = (res) => res.status(429).json({ error: 'Too many attempts. Please wait a few minutes and try again.' });

const validPassword = (p) => typeof p === 'string' && p.length >= 8 && p.length <= 200;

// ---------------------------------------------------------------------------
// Auth routes
// ---------------------------------------------------------------------------

app.post('/api/auth/signup', async (req, res) => {
  if (!signupLimit(req.ip)) return tooMany(res);
  const { name, email, password } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || name.length > 100) return res.status(400).json({ error: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!validPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const normalised = normaliseEmail(email);
  if (db.prepare('SELECT 1 FROM users WHERE email = ?').get(normalised)) {
    return res.status(409).json({ error: 'An account with this email already exists. Try signing in.' });
  }

  const user = { id: newId(), email: normalised, name: name.trim(), created_at: new Date().toISOString() };
  db.prepare('INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)').run(
    user.id,
    user.email,
    user.name,
    await hashPassword(password),
    user.created_at,
  );
  startSession(res, user.id);
  res.status(201).json({ user: publicUser(user) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!isEmail(email) || typeof password !== 'string') return res.status(400).json({ error: 'Please enter your email and password.' });
  const normalised = normaliseEmail(email);
  if (!loginLimit(`${req.ip}|${normalised}`)) return tooMany(res);

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normalised);
  if (!user) {
    await burnTime(password);
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  if (!(await verifyPassword(password, user.password_hash))) {
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }
  startSession(res, user.id);
  res.json({ user: publicUser(user) });
});

app.post('/api/auth/logout', (req, res) => {
  const token = readCookie(req, COOKIE);
  if (token) db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(hashToken(token));
  setSessionCookie(res, '', 0);
  res.json({ ok: true });
});

app.get('/api/auth/me', (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const user = currentUser(req);
  res.json({ user: user ? publicUser(user) : null });
});

app.post('/api/auth/forgot', async (req, res) => {
  if (!forgotLimit(req.ip)) return tooMany(res);
  const { email } = req.body ?? {};
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(normaliseEmail(email));
  if (user) {
    const token = newToken();
    db.prepare('INSERT INTO password_resets (token_hash, user_id, expires_at) VALUES (?, ?, ?)').run(
      hashToken(token),
      user.id,
      Date.now() + config.resetLinkMinutes * 60 * 1000,
    );
    const link = `${config.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await sendMail({ to: user.email, ...resetPasswordEmail({ name: user.name, link, minutes: config.resetLinkMinutes }) });
    } catch (err) {
      console.error('Could not send reset email:', err);
      return res.status(502).json({ error: 'We could not send the email right now. Please try again later.' });
    }
  }
  // Same answer either way, so the form doesn't reveal which emails have accounts.
  res.json({ ok: true });
});

app.post('/api/auth/reset', async (req, res) => {
  const { token, password } = req.body ?? {};
  if (typeof token !== 'string' || !token) return res.status(400).json({ error: 'This reset link is invalid or has expired.' });
  if (!validPassword(password)) return res.status(400).json({ error: 'Password must be at least 8 characters.' });

  const reset = db
    .prepare('SELECT * FROM password_resets WHERE token_hash = ? AND used = 0 AND expires_at > ?')
    .get(hashToken(token), Date.now());
  if (!reset) return res.status(400).json({ error: 'This reset link is invalid or has expired. Please request a new one.' });

  db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(await hashPassword(password), reset.user_id);
  db.prepare('UPDATE password_resets SET used = 1 WHERE user_id = ?').run(reset.user_id);
  // Sign out everywhere: anyone using the old password loses access.
  db.prepare('DELETE FROM sessions WHERE user_id = ?').run(reset.user_id);
  res.json({ ok: true });
});

// ---------------------------------------------------------------------------
// Contact form
// ---------------------------------------------------------------------------

app.post('/api/contact', async (req, res) => {
  if (!contactLimit(req.ip)) return tooMany(res);
  const { name, email, interest, message } = req.body ?? {};
  if (typeof name !== 'string' || !name.trim() || name.length > 100) return res.status(400).json({ error: 'Please enter your name.' });
  if (!isEmail(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) {
    return res.status(400).json({ error: 'Please write a message of at least 10 characters.' });
  }
  const user = currentUser(req);
  db.prepare('INSERT INTO contact_messages (name, email, interest, message, user_id, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    name.trim(),
    normaliseEmail(email),
    typeof interest === 'string' ? interest.slice(0, 100) : null,
    message.trim(),
    user?.id ?? null,
    new Date().toISOString(),
  );
  if (config.contactTo) {
    sendMail({
      to: config.contactTo,
      subject: `New message: ${interest || 'Website contact'}`,
      text: `From: ${name.trim()} <${email}>\nInterested in: ${interest || '-'}\n\n${message.trim()}`,
    }).catch((err) => console.error('Could not send contact notification:', err));
  }
  res.status(201).json({ ok: true });
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found.' }));

// ---------------------------------------------------------------------------
// Website (production): serve the built site from ../dist with SPA fallback
// ---------------------------------------------------------------------------

if (fs.existsSync(path.join(config.distDir, 'index.html'))) {
  app.use(express.static(config.distDir, { index: false, maxAge: '1h' }));
  app.use((req, res, next) => {
    if (req.method !== 'GET') return next();
    res.sendFile(path.join(config.distDir, 'index.html'));
  });
}

// Errors (bad JSON etc.)
app.use((err, _req, res, _next) => {
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request.' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

cleanUp();
setInterval(cleanUp, 60 * 60 * 1000).unref();

app.listen(config.port, () => {
  console.log(`${config.appName} API running on http://localhost:${config.port}`);
  console.log(`Emails: ${mailEnabled ? 'sent via SMTP' : 'printed here (SMTP not configured)'}`);
});
