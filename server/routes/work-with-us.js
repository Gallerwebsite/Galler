const express = require('express');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const { Resend } = require('resend');
const { readJSON, writeJSON } = require('../utils/dataStore');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

async function getSubmissions() {
  return (await readJSON('work-with-us-submissions.json')) || [];
}

async function saveSubmissions(data) {
  await writeJSON('work-with-us-submissions.json', data);
}

function buildEmailHtml({ fullName, companyName, email, phone, subject, details, workType }) {
  return `
    <h2>New Work With Us inquiry</h2>
    <p><strong>Service:</strong> ${workType || '—'}</p>
    <p><strong>Name:</strong> ${fullName}</p>
    <p><strong>Company:</strong> ${companyName}</p>
    <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Phone:</strong> ${phone || '—'}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <hr />
    <p><strong>Details:</strong></p>
    <p>${details.replace(/\n/g, '<br />')}</p>
  `;
}

router.post(
  '/',
  [
    body('fullName').trim().notEmpty().isLength({ max: 200 }),
    body('companyName').trim().notEmpty().isLength({ max: 200 }),
    body('email').trim().isEmail(),
    body('phone').optional({ values: 'falsy' }).trim().isLength({ max: 50 }),
    body('subject').trim().notEmpty().isLength({ max: 200 }),
    body('details').trim().notEmpty().isLength({ max: 5000 }),
    body('workType').optional({ values: 'falsy' }).trim().isLength({ max: 100 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Please check the form and try again.' });
    }

    const { fullName, companyName, email, phone, subject, details, workType } = req.body;

    const submission = {
      id: crypto.randomUUID(),
      fullName,
      companyName,
      email,
      phone: phone || '',
      subject,
      details,
      workType: workType || '',
      read: false,
      emailSent: false,
      createdAt: new Date().toISOString(),
    };

    const submissions = await getSubmissions();
    submissions.unshift(submission);
    await saveSubmissions(submissions);

    const apiKey = process.env.RESEND_API_KEY;
    const toEmail = process.env.CONTACT_TO_EMAIL;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || 'Galler Website <onboarding@resend.dev>';

    if (!apiKey || !toEmail) {
      return res.status(201).json({
        message: 'Your inquiry was received.',
        id: submission.id,
        emailSent: false,
      });
    }

    try {
      const resend = new Resend(apiKey);
      const result = await resend.emails.send({
        from: fromEmail,
        to: [toEmail],
        replyTo: email,
        subject: `[Galler Work With Us] ${workType ? `${workType} — ` : ''}${subject} — ${fullName}`,
        html: buildEmailHtml(submission),
      });

      if (result.error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Resend error:', result.error.message || result.error);
        }
        return res.status(201).json({
          message: 'Your inquiry was received. Email notification could not be sent.',
          id: submission.id,
          emailSent: false,
        });
      }

      submission.emailSent = true;
      submissions[0] = submission;
      await saveSubmissions(submissions);

      return res.status(201).json({
        message: 'Your inquiry was sent successfully.',
        id: submission.id,
        emailSent: true,
      });
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Resend error:', err?.message || err);
      }
      return res.status(201).json({
        message: 'Your inquiry was received. We could not send the email notification.',
        id: submission.id,
        emailSent: false,
      });
    }
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
