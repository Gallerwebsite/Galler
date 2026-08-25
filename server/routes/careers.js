const express = require('express');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { readJSON, writeJSON } = require('../utils/dataStore');
const mediaStorage = require('../utils/mediaStorage');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

const resumesDir = path.join(__dirname, '..', 'private', 'resumes');

if (!fs.existsSync(resumesDir)) {
  fs.mkdirSync(resumesDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, resumesDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `resume-${uniqueSuffix}${ext}`);
  },
});

const uploadResume = multer({
  storage: mediaStorage.isConfigured() ? multer.memoryStorage() : diskStorage,
  fileFilter: (_req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const allowedExtensions = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (allowedTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
      cb(null, true);
      return;
    }

    cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

const VALID_CATEGORIES = ['engineering', 'sales', 'operations', 'manufacturing', 'support'];
const VALID_JOB_TYPES = ['Full Time', 'PPO'];

const CATEGORY_LABELS = {
  engineering: 'Engineering',
  sales: 'Sales & Marketing',
  operations: 'Operations',
  manufacturing: 'Manufacturing',
  support: 'Support',
};

async function getJobs() {
  return (await readJSON('careers-jobs.json')) || [];
}

async function saveJobs(data) {
  await writeJSON('careers-jobs.json', data);
}

async function getGeneralSubmissions() {
  return (await readJSON('resume-submissions.json')) || [];
}

async function saveGeneralSubmissions(data) {
  await writeJSON('resume-submissions.json', data);
}

async function getJobApplications() {
  return (await readJSON('job-applications.json')) || [];
}

async function saveJobApplications(data) {
  await writeJSON('job-applications.json', data);
}

function getDescriptionPoints(job) {
  if (Array.isArray(job.descriptionPoints)) {
    return job.descriptionPoints.map((point) => String(point).trim()).filter(Boolean);
  }
  if (job.description) {
    return [String(job.description).trim()].filter(Boolean);
  }
  return [];
}

function validateJobBody(body, partial = false) {
  const title = String(body.title || '').trim();
  const descriptionPoints = getDescriptionPoints(body);
  const location = String(body.location || '').trim();
  const experience = String(body.experience || '').trim();
  const type = String(body.type || '').trim();
  const category = String(body.category || '').trim();

  if (!partial || body.title !== undefined) {
    if (!title || title.length > 200) return 'Please enter a valid job title.';
  }
  if (!partial || body.descriptionPoints !== undefined || body.description !== undefined) {
    if (descriptionPoints.length === 0) return 'Please add at least one description point.';
    if (descriptionPoints.some((point) => point.length > 1000)) {
      return 'Each description point must be 1000 characters or less.';
    }
    if (descriptionPoints.length > 50) return 'A job can have at most 50 description points.';
  }
  if (!partial || body.location !== undefined) {
    if (!location || location.length > 200) return 'Please enter a valid location.';
  }
  if (!partial || body.experience !== undefined) {
    if (!experience || experience.length > 100) return 'Please enter valid experience.';
  }
  if (!partial || body.type !== undefined) {
    if (!VALID_JOB_TYPES.includes(type)) return 'Job type must be Full Time or PPO.';
  }
  if (!partial || body.category !== undefined) {
    if (!VALID_CATEGORIES.includes(category)) return 'Please select a valid category.';
  }

  return null;
}

function normalizeJob(body, existing = {}) {
  const category = String(body.category ?? existing.category ?? 'engineering').trim();
  const descriptionPoints = getDescriptionPoints({ ...existing, ...body });
  return {
    id: existing.id || crypto.randomUUID(),
    title: String(body.title ?? existing.title ?? '').trim(),
    descriptionPoints,
    location: String(body.location ?? existing.location ?? '').trim(),
    experience: String(body.experience ?? existing.experience ?? '').trim(),
    type: String(body.type ?? existing.type ?? 'Full Time').trim(),
    category,
    department: CATEGORY_LABELS[category] || category,
  };
}

async function cleanupUploadedFile(file) {
  if (!file) return;

  if (file.path) {
    await fs.promises.unlink(file.path).catch(() => {});
  }
}

async function buildResumeFields(file) {
  if (mediaStorage.isConfigured()) {
    const result = await mediaStorage.uploadResume(file.buffer, file.originalname);
    return {
      resumeFileName: result.fileId || result.public_id || result.name,
      resumeOriginalName: file.originalname,
      resumeSize: file.size,
      resumeUrl: result.secure_url || result.url,
    };
  }

  return {
    resumeFileName: file.filename,
    resumeOriginalName: file.originalname,
    resumeSize: file.size,
  };
}

function handleResumeUpload(req, res, onSuccess) {
  uploadResume.single('resume')(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File too large. Max size is 5MB.' });
      }
      return res.status(400).json({ message: err.message });
    }
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const fullName = String(req.body.fullName || '').trim();
    const email = String(req.body.email || '').trim();
    const phone = String(req.body.phone || '').trim();

    if (!fullName || fullName.length > 200) {
      await cleanupUploadedFile(req.file);
      return res.status(400).json({ message: 'Please enter your full name.' });
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      await cleanupUploadedFile(req.file);
      return res.status(400).json({ message: 'Please enter a valid email address.' });
    }

    if (phone.length > 50) {
      await cleanupUploadedFile(req.file);
      return res.status(400).json({ message: 'Please check the form and try again.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Please attach your resume file.' });
    }

    try {
      const resumeFields = await buildResumeFields(req.file);
      return onSuccess({ fullName, email, phone, resumeFields });
    } catch (uploadErr) {
      await cleanupUploadedFile(req.file);
      if (process.env.NODE_ENV !== 'production') {
        console.error('Resume upload failed:', uploadErr.message || uploadErr);
      }
      return res.status(500).json({ message: 'Resume upload failed. Please try again.' });
    }
  });
}

async function sendResumeDownload(res, submission) {
  if (submission.resumeUrl) {
    return res.redirect(submission.resumeUrl);
  }

  const filePath = path.join(resumesDir, submission.resumeFileName);
  if (!filePath.startsWith(resumesDir) || !fs.existsSync(filePath)) {
    return res.status(404).json({ message: 'Resume file not found' });
  }

  return res.download(filePath, submission.resumeOriginalName);
}

router.get('/jobs', async (_req, res) => {
  const jobs = (await getJobs()).map((job) => {
    const normalized = normalizeJob(job, job);
    return {
      ...normalized,
      department: normalized.department || CATEGORY_LABELS[normalized.category] || normalized.category,
    };
  });
  res.json(jobs);
});

router.post('/jobs', authMiddleware, async (req, res) => {
  const job = normalizeJob(req.body);
  const error = validateJobBody(job);
  if (error) return res.status(400).json({ message: error });

  const jobs = await getJobs();
  jobs.unshift(job);
  await saveJobs(jobs);
  res.status(201).json({ message: 'Job opening added', data: job });
});

router.put('/jobs/:id', authMiddleware, async (req, res) => {
  const jobs = await getJobs();
  const index = jobs.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Job opening not found' });
  }

  const updated = normalizeJob(req.body, jobs[index]);
  const error = validateJobBody(updated);
  if (error) return res.status(400).json({ message: error });

  jobs[index] = updated;
  await saveJobs(jobs);
  res.json({ message: 'Job opening updated', data: updated });
});

router.delete('/jobs/:id', authMiddleware, async (req, res) => {
  const jobs = await getJobs();
  const index = jobs.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Job opening not found' });
  }

  jobs.splice(index, 1);
  await saveJobs(jobs);
  res.json({ message: 'Job opening deleted' });
});

router.post('/resume', (req, res) => {
  handleResumeUpload(req, res, async ({ fullName, email, phone, resumeFields }) => {
    const message = String(req.body.message || '').trim();
    if (message.length > 2000) {
      return res.status(400).json({ message: 'Please check the form and try again.' });
    }

    const submission = {
      id: crypto.randomUUID(),
      type: 'general',
      fullName,
      email,
      phone,
      message,
      ...resumeFields,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const submissions = await getGeneralSubmissions();
    submissions.unshift(submission);
    await saveGeneralSubmissions(submissions);

    return res.status(201).json({
      message: 'Your resume was submitted successfully.',
      id: submission.id,
    });
  });
});

router.post('/apply', (req, res) => {
  handleResumeUpload(req, res, async ({ fullName, email, phone, resumeFields }) => {
    const jobId = String(req.body.jobId || '').trim();
    const jobs = await getJobs();
    const job = jobs.find((item) => item.id === jobId);

    if (!job) {
      return res.status(400).json({ message: 'Selected job opening is no longer available.' });
    }

    const application = {
      id: crypto.randomUUID(),
      jobId: job.id,
      jobTitle: job.title,
      jobDescription: getDescriptionPoints(job).join('\n'),
      jobCategory: job.category,
      jobLocation: job.location,
      jobExperience: job.experience,
      jobType: job.type,
      fullName,
      email,
      phone,
      ...resumeFields,
      read: false,
      createdAt: new Date().toISOString(),
    };

    const applications = await getJobApplications();
    applications.unshift(application);
    await saveJobApplications(applications);

    return res.status(201).json({
      message: 'Your application was submitted successfully.',
      id: application.id,
    });
  });
});

router.get('/resumes', authMiddleware, async (_req, res) => {
  res.json(await getGeneralSubmissions());
});

router.get('/applications', authMiddleware, async (_req, res) => {
  res.json(await getJobApplications());
});

router.patch('/resumes/:id/read', authMiddleware, async (req, res) => {
  const submissions = await getGeneralSubmissions();
  const index = submissions.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  submissions[index].read = true;
  await saveGeneralSubmissions(submissions);
  res.json(submissions[index]);
});

router.patch('/applications/:id/read', authMiddleware, async (req, res) => {
  const applications = await getJobApplications();
  const index = applications.findIndex((item) => item.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ message: 'Application not found' });
  }

  applications[index].read = true;
  await saveJobApplications(applications);
  res.json(applications[index]);
});

router.get('/resumes/:id/download', authMiddleware, async (req, res) => {
  const submissions = await getGeneralSubmissions();
  const submission = submissions.find((item) => item.id === req.params.id);
  if (!submission) {
    return res.status(404).json({ message: 'Submission not found' });
  }

  return sendResumeDownload(res, submission);
});

router.get('/applications/:id/download', authMiddleware, async (req, res) => {
  const applications = await getJobApplications();
  const application = applications.find((item) => item.id === req.params.id);
  if (!application) {
    return res.status(404).json({ message: 'Application not found' });
  }

  return sendResumeDownload(res, application);
});

module.exports = router;
