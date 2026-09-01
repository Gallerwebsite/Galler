const { Resend } = require('resend');

function getNotifyEmail() {
  return (
    process.env.CONTACT_NOTIFY_EMAIL ||
    process.env.CONTACT_TO_EMAIL ||
    ''
  ).trim().toLowerCase();
}

function getFromEmail() {
  return (
    process.env.RESEND_FROM_EMAIL ||
    process.env.CONTACT_FROM_EMAIL ||
    process.env.NEWSLETTER_FROM_EMAIL ||
    'Galler Website <onboarding@resend.dev>'
  ).trim();
}

function isEmailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && getNotifyEmail());
}

function escapeHtml(text) {
  return String(text ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textToHtml(text) {
  return escapeHtml(text).replace(/\n/g, '<br />');
}

async function sendNotificationEmail({ subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = getNotifyEmail();
  const fromEmail = getFromEmail();

  if (!apiKey || !toEmail) {
    return { sent: false, reason: 'not_configured' };
  }

  try {
    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo,
      subject,
      html,
    });

    if (result.error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Resend error:', result.error.message || result.error);
      }
      return { sent: false, reason: 'send_failed', error: result.error };
    }

    return { sent: true };
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Resend error:', err?.message || err);
    }
    return { sent: false, reason: 'send_failed', error: err };
  }
}

module.exports = {
  getNotifyEmail,
  getFromEmail,
  isEmailConfigured,
  escapeHtml,
  textToHtml,
  sendNotificationEmail,
};
