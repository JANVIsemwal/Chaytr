import nodemailer from 'nodemailer';

import { config } from './config.mjs';

// Real sending needs a host, and a password whenever a user name is set; until then, print to the console.
const transport = config.smtp.host && (!config.smtp.user || config.smtp.pass)
  ? nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
    })
  : null;

export const mailEnabled = Boolean(transport);

/**
 * Sends an email. Without SMTP settings (local development) the email is printed
 * to the server console instead, so links can still be clicked.
 */
export async function sendMail({ to, subject, text, html }) {
  if (!transport) {
    console.log(`\n──── Email (not sent: SMTP not configured) ────\nTo: ${to}\nSubject: ${subject}\n\n${text}\n───────────────────────────────────────────────\n`);
    return;
  }
  await transport.sendMail({ from: config.smtp.from, to, subject, text, html });
}

const escape = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function resetPasswordEmail({ name, link, minutes }) {
  const subject = `Reset your ${config.appName} password`;
  const text = `Hi ${name},

We received a request to reset the password for your ${config.appName} account.

Choose a new password here (the link works once and expires in ${minutes} minutes):
${link}

If you didn't ask for this, you can ignore this email. Your password won't change.

— ${config.appName}`;
  const html = `
  <div style="font-family:Inter,Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px;color:#150B33">
    <h2 style="margin:0 0 16px">Reset your password</h2>
    <p>Hi ${escape(name)},</p>
    <p>We received a request to reset the password for your ${escape(config.appName)} account.</p>
    <p style="margin:28px 0">
      <a href="${escape(link)}" style="background:#7C3AED;color:#fff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:600">Choose a new password</a>
    </p>
    <p style="color:#5F5880;font-size:14px">This link works once and expires in ${minutes} minutes. If you didn't ask for this, you can ignore this email.</p>
  </div>`;
  return { subject, text, html };
}
