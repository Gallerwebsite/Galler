const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const { readJSON, writeJSON } = require('../utils/dataStore');
const { getFromEmail, escapeHtml, textToHtml } = require('../utils/email');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const SUBSCRIBERS_FILE = 'newsletter-subscribers.json';
const CAMPAIGNS_FILE = 'newsletter-campaigns.json';

async function getSubscribers() {
  return (await readJSON(SUBSCRIBERS_FILE)) || [];
}

async function saveSubscribers(data) {
  await writeJSON(SUBSCRIBERS_FILE, data);
}

async function getCampaigns() {
  return (await readJSON(CAMPAIGNS_FILE)) || [];
}

async function saveCampaigns(data) {
  await writeJSON(CAMPAIGNS_FILE, data);
}

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getFrontendUrl() {
  return (process.env.FRONTEND_URL || 'http://localhost:3000').replace(/\/$/, '');
}

function buildUnsubscribeUrl(token) {
  return `${getFrontendUrl()}/unsubscribe?token=${encodeURIComponent(token)}`;
}

function buildNewsletterHtml({ subject, body, unsubscribeUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1a1a1a;">
      <h1 style="font-size: 22px; margin-bottom: 16px;">${escapeHtml(subject)}</h1>
      <div style="font-size: 15px; line-height: 1.6;">${textToHtml(body)}</div>
      <hr style="margin: 32px 0; border: none; border-top: 1px solid #e5e5e5;" />
      <p style="font-size: 12px; color: #888;">
        You received this email because you subscribed to the Galler newsletter.
        <a href="${unsubscribeUrl}" style="color: #b8451a;">Unsubscribe</a>
      </p>
    </div>
  `;
}

router.post(
  '/subscribe',
  [
    body('email').trim().isEmail().normalizeEmail(),
    body('source')
      .optional({ values: 'falsy' })
      .trim()
      .isIn(['footer', 'careers-talent-network']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    const email = normalizeEmail(req.body.email);
    const source = req.body.source || 'footer';
    const subscribers = await getSubscribers();
    const existing = subscribers.find((item) => normalizeEmail(item.email) === email);

    if (existing) {
      if (existing.status === 'active') {
        return res.status(200).json({ message: 'You are already subscribed. Thank you!' });
      }

      existing.status = 'active';
      existing.subscribedAt = new Date().toISOString();
      existing.unsubscribedAt = null;
      await saveSubscribers(subscribers);

      return res.status(200).json({ message: 'Welcome back! You have been resubscribed.' });
    }

    const subscriber = {
      id: crypto.randomUUID(),
      email,
      status: 'active',
      unsubscribeToken: crypto.randomBytes(32).toString('hex'),
      source,
      subscribedAt: new Date().toISOString(),
      unsubscribedAt: null,
    };

    subscribers.unshift(subscriber);
    await saveSubscribers(subscribers);

    return res.status(201).json({ message: 'Thanks for subscribing!' });
  }
);

router.post(
  '/unsubscribe',
  [body('token').trim().notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid unsubscribe link.' });
    }

    const subscribers = await getSubscribers();
    const subscriber = subscribers.find((item) => item.unsubscribeToken === req.body.token);

    if (!subscriber) {
      return res.status(404).json({ message: 'This unsubscribe link is invalid or has expired.' });
    }

    if (subscriber.status !== 'unsubscribed') {
      subscriber.status = 'unsubscribed';
      subscriber.unsubscribedAt = new Date().toISOString();
      await saveSubscribers(subscribers);
    }

    return res.json({ message: 'You have been unsubscribed from our newsletter.' });
  }
);

router.get('/subscribers', authMiddleware, async (req, res) => {
  res.json(await getSubscribers());
});

router.delete('/subscribers/:id', authMiddleware, async (req, res) => {
  const subscribers = await getSubscribers();
  const index = subscribers.findIndex((item) => item.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Subscriber not found.' });
  }

  subscribers.splice(index, 1);
  await saveSubscribers(subscribers);
  res.json({ message: 'Subscriber removed.' });
});

router.get('/campaigns', authMiddleware, async (req, res) => {
  res.json(await getCampaigns());
});

router.post(
  '/send',
  authMiddleware,
  [
    body('subject').trim().notEmpty().isLength({ max: 200 }),
    body('body').trim().notEmpty().isLength({ max: 50000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Subject and message are required.' });
    }

    const { subject, body: messageBody } = req.body;
    const apiKey = process.env.RESEND_API_KEY;
    const activeSubscribers = (await getSubscribers()).filter((item) => item.status === 'active');

    if (activeSubscribers.length === 0) {
      return res.status(400).json({ message: 'No active subscribers to send to.' });
    }

    const campaign = {
      id: crypto.randomUUID(),
      subject,
      bodyPreview: messageBody.slice(0, 120),
      recipientCount: activeSubscribers.length,
      sentCount: 0,
      failedCount: 0,
      emailConfigured: Boolean(apiKey),
      createdAt: new Date().toISOString(),
    };

    if (!apiKey) {
      const campaigns = await getCampaigns();
      campaigns.unshift({
        ...campaign,
        failedCount: activeSubscribers.length,
        note: 'RESEND_API_KEY is not configured.',
      });
      await saveCampaigns(campaigns);

      return res.status(503).json({
        message: 'Email sending is not configured yet. Add RESEND_API_KEY to your server environment.',
        campaign: campaigns[0],
      });
    }

    const resend = new Resend(apiKey);
    const fromEmail = getFromEmail();
    const failures = [];

    for (const subscriber of activeSubscribers) {
      const unsubscribeUrl = buildUnsubscribeUrl(subscriber.unsubscribeToken);

      try {
        const result = await resend.emails.send({
          from: fromEmail,
          to: [subscriber.email],
          subject,
          html: buildNewsletterHtml({ subject, body: messageBody, unsubscribeUrl }),
        });

        if (result.error) {
          failures.push({ email: subscriber.email, error: result.error.message || 'Send failed' });
        } else {
          campaign.sentCount += 1;
        }
      } catch (err) {
        failures.push({ email: subscriber.email, error: err?.message || 'Send failed' });
      }
    }

    campaign.failedCount = failures.length;

    const campaigns = await getCampaigns();
    campaigns.unshift(campaign);
    await saveCampaigns(campaigns);

    if (campaign.sentCount === 0) {
      return res.status(502).json({
        message: 'Newsletter could not be sent. Verify your domain in Resend and check RESEND_API_KEY.',
        campaign,
        failures,
      });
    }

    return res.json({
      message: `Newsletter sent to ${campaign.sentCount} of ${campaign.recipientCount} subscribers.`,
      campaign,
      failures,
    });
  }
);

module.exports = router;
