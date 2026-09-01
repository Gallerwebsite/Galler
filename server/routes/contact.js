const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { readJSON, writeJSON } = require('../utils/dataStore');
const { escapeHtml, textToHtml, sendNotificationEmail } = require('../utils/email');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

async function getSubmissions() {
  return (await readJSON('contact-submissions.json')) || [];
}

async function saveSubmissions(data) {
  await writeJSON('contact-submissions.json', data);
}

function buildEmailHtml({ fullName, companyName, email, phone, subject, message }) {
  return `
    <h2>New contact form submission</h2>
    <p><strong>Name:</strong> ${escapeHtml(fullName)}</p>
    <p><strong>Company:</strong> ${escapeHtml(companyName || '—')}</p>
    <p><strong>Email:</strong> <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></p>
    <p><strong>Phone:</strong> ${escapeHtml(phone || '—')}</p>
    <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
    <hr />
    <p><strong>Message:</strong></p>
    <p>${textToHtml(message)}</p>
  `;
}

router.post(
  '/',
  [
    body('fullName').trim().notEmpty().isLength({ max: 200 }),
    body('companyName').optional({ values: 'falsy' }).trim().isLength({ max: 200 }),
    body('email').trim().isEmail(),
    body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 50 }),
    body('subject').trim().notEmpty().isLength({ max: 200 }),
    body('message').trim().notEmpty().isLength({ max: 5000 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Please check the form and try again.' });
    }

    const { fullName, companyName, email, phone, subject, message } = req.body;

    const submission = {
      id: crypto.randomUUID(),
      fullName,
      companyName: companyName || '',
      email,
      phone: phone || '',
      subject,
      message,
      read: false,
      emailSent: false,
      createdAt: new Date().toISOString(),
    };

    const submissions = await getSubmissions();
    submissions.unshift(submission);
    await saveSubmissions(submissions);

    const emailResult = await sendNotificationEmail({
      replyTo: email,
      subject: `[Galler Contact] ${subject} — ${fullName}`,
      html: buildEmailHtml(submission),
    });

    if (!emailResult.sent) {
      return res.status(201).json({
        message:
          emailResult.reason === 'not_configured'
            ? 'Your message was received.'
            : 'Your message was received. Email notification could not be sent.',
        id: submission.id,
        emailSent: false,
      });
    }

    submission.emailSent = true;
    submissions[0] = submission;
    await saveSubmissions(submissions);

    return res.status(201).json({
      message: 'Your message was sent successfully.',
      id: submission.id,
      emailSent: true,
    });
  }
);

router.get('/', authMiddleware, async (req, res) => {
  res.json(await getSubmissions());
});

router.patch('/:id/read', authMiddleware, async (req, res) => {
  const submissions = await getSubmissions();
  const index = submissions.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  submissions[index].read = true;
  await saveSubmissions(submissions);
  res.json(submissions[index]);
});

module.exports = router;
